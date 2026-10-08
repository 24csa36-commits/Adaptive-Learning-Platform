package com.example.demo.service;

import com.example.demo.dto.MonitoringBatchRequest;
import com.example.demo.model.MonitoringContext;
import com.example.demo.model.MonitoringEvent;
import com.example.demo.model.MonitoringEventType;
import com.example.demo.model.MonitoringSession;
import com.example.demo.repository.MonitoringEventRepository;
import com.example.demo.repository.MonitoringSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MonitoringService {

    private final MonitoringSessionRepository sessionRepository;
    private final MonitoringEventRepository eventRepository;

    public MonitoringService(MonitoringSessionRepository sessionRepository, MonitoringEventRepository eventRepository) {
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
    }

    public MonitoringSession createSession(Long userId, Long courseId, Long lessonId, String contextStr) {
        MonitoringSession session = new MonitoringSession();
        session.setUserId(userId);
        session.setCourseId(courseId);
        session.setLessonId(lessonId);
        
        try {
            session.setContext(MonitoringContext.valueOf(contextStr.toUpperCase()));
        } catch (Exception e) {
            session.setContext(MonitoringContext.LEARNING);
        }
        
        session.setStartedAt(LocalDateTime.now());
        // Issue 1: Coverage initializes to 0%, as no time has passed yet.
        session.setMonitoringCoverage("0%"); 
        
        return sessionRepository.save(session);
    }

    public MonitoringSession closeSession(Long sessionId) {
        MonitoringSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("Session not found"));
            
        // Issue 4: Safely ignore multiple close requests
        if (session.getEndedAt() == null) {
            session.setEndedAt(LocalDateTime.now());
            return sessionRepository.save(session);
        }
        return session;
    }

    public void ingestEvents(MonitoringBatchRequest request) {
        if (request == null || request.getEvents() == null || request.getEvents().isEmpty()) {
            return;
        }

        MonitoringSession session = sessionRepository.findById(request.getSessionId())
            .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        // Issue 4: Reject events for closed sessions
        if (session.getEndedAt() != null) {
            throw new IllegalArgumentException("Session is already closed");
        }

        List<MonitoringEvent> eventsToSave = new ArrayList<>();
        
        for (MonitoringBatchRequest.EventDto dto : request.getEvents()) {
            // Issue 2: Validation constraints
            if (dto.getType() == null || dto.getType().isEmpty()) {
                throw new IllegalArgumentException("Event type is required");
            }
            if (dto.getContext() == null || dto.getContext().isEmpty()) {
                throw new IllegalArgumentException("Context is required");
            }
            if (dto.getSource() == null || dto.getSource().isEmpty()) {
                throw new IllegalArgumentException("Source is required");
            }
            if (dto.getDurationMs() != null && dto.getDurationMs() < 0) {
                throw new IllegalArgumentException("Duration cannot be negative");
            }
            if (dto.getStartTs() == null) {
                throw new IllegalArgumentException("Start timestamp is required");
            }
            
            MonitoringEvent event = new MonitoringEvent();
            event.setMonitoringSession(session);
            
            // Issue 3: Session Ownership is Authoritative
            event.setUserId(session.getUserId());
            event.setLessonId(session.getLessonId());
            event.setContext(session.getContext()); 
            
            try {
                event.setEventType(MonitoringEventType.valueOf(dto.getType().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid event type: " + dto.getType());
            }
            
            event.setStartTimestamp(dto.getStartTs());
            event.setDurationMs(dto.getDurationMs() != null ? dto.getDurationMs() : 0L);
            event.setSource(dto.getSource());
            
            eventsToSave.add(event);
        }
        
        if (!eventsToSave.isEmpty()) {
            eventRepository.saveAll(eventsToSave);
        }
    }
}
