package com.example.demo.service;

import com.example.demo.config.MonitoringProperties;
import com.example.demo.dto.EngagementScoreDto;
import com.example.demo.model.MonitoringContext;
import com.example.demo.model.MonitoringEvent;
import com.example.demo.model.MonitoringEventType;
import com.example.demo.model.MonitoringSession;
import com.example.demo.repository.MonitoringEventRepository;
import com.example.demo.repository.MonitoringSessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class EngagementScoringServiceTest {

    private MonitoringSessionRepository sessionRepo;
    private MonitoringEventRepository eventRepo;
    private MonitoringProperties properties;
    private EngagementScoringService scoringService;

    @BeforeEach
    void setUp() {
        sessionRepo = Mockito.mock(MonitoringSessionRepository.class);
        eventRepo = Mockito.mock(MonitoringEventRepository.class);
        properties = new MonitoringProperties(); // defaults are fine
        scoringService = new EngagementScoringService(sessionRepo, eventRepo, properties);
    }

    private MonitoringSession createSession(Long id, LocalDateTime start) {
        MonitoringSession s = new MonitoringSession();
        s.setId(id);
        s.setStartedAt(start);
        s.setMonitoringCoverage("100%");
        return s;
    }

    private MonitoringEvent createEvent(MonitoringEventType type, LocalDateTime start, long durationMs) {
        MonitoringEvent e = new MonitoringEvent();
        e.setEventType(type);
        e.setStartTimestamp(start);
        e.setDurationMs(durationMs);
        return e;
    }

    @Test
    void testA_VeryShortObservation() {
        LocalDateTime now = LocalDateTime.now();
        // 200ms observation
        MonitoringSession s = createSession(1L, now.minus(Duration.ofMillis(200)));
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.emptyList());

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals("INSUFFICIENT_DATA", res.getEngagementStatus());
        assertNull(res.getEngagementScore());
    }

    @Test
    void testB_JustBelowMinimumObservation() {
        LocalDateTime now = LocalDateTime.now();
        // 59,000 ms observation
        MonitoringSession s = createSession(1L, now.minus(Duration.ofMillis(59000)));
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.emptyList());

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals("INSUFFICIENT_DATA", res.getEngagementStatus());
        assertNull(res.getEngagementScore());
    }

    @Test
    void testC_EnoughObservation() {
        LocalDateTime now = LocalDateTime.now();
        // 61,000 ms observation
        MonitoringSession s = createSession(1L, now.minus(Duration.ofMillis(61000)));
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.emptyList());

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertNotNull(res.getEngagementScore());
        assertEquals(100.0, res.getEngagementScore());
    }

    @Test
    void test2_OneValidFocusLoss() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusMinutes(5); // 5 min window
        MonitoringSession s = createSession(1L, start);

        MonitoringEvent ev = createEvent(MonitoringEventType.FOCUS_LOST, start.plusMinutes(1), properties.getFocusLossThresholdMs() + 1000);
        
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.singletonList(ev));

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertNotNull(res.getEngagementScore());
        assertTrue(res.getEngagementScore() < 100.0);
        assertEquals(properties.getFocusLossThresholdMs() + 1000, res.getAffectedDurationMs());
    }

    @Test
    void test4_FaceAbsenceBelowThreshold() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusMinutes(5);
        MonitoringSession s = createSession(1L, start);

        MonitoringEvent ev = createEvent(MonitoringEventType.FACE_ABSENT, start.plusMinutes(1), properties.getFaceAbsenceThresholdMs() - 1000); // BELOW THRESHOLD
        
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.singletonList(ev));

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals(100.0, res.getEngagementScore()); // Unpenalized
        assertEquals(0L, res.getAffectedDurationMs());
    }

    @Test
    void test6_OverlappingEvents() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusMinutes(5);
        MonitoringSession s = createSession(1L, start);

        // Two overlapping events, each 10s, offset by 5s. Total penalty should be 15s (15000ms)
        MonitoringEvent ev1 = createEvent(MonitoringEventType.FOCUS_LOST, start.plusMinutes(1), 10000);
        MonitoringEvent ev2 = createEvent(MonitoringEventType.FACE_ABSENT, start.plusMinutes(1).plusSeconds(5), 10000);
        
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Arrays.asList(ev1, ev2));

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals(15000L, res.getAffectedDurationMs());
    }

    @Test
    void test7_EventsOutsideWindow() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusMinutes(10); // Window is 5 mins max (properties.getEngagementWindowMs())
        MonitoringSession s = createSession(1L, start);

        // Event occurred 8 mins ago, outside the 5 min scoring window
        MonitoringEvent ev = createEvent(MonitoringEventType.FOCUS_LOST, start.plusMinutes(2), 10000);
        
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.singletonList(ev));

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals(100.0, res.getEngagementScore()); 
        assertEquals(0L, res.getAffectedDurationMs());
    }

    @Test
    void test8_FutureTimestamps() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusMinutes(5);
        MonitoringSession s = createSession(1L, start);

        MonitoringEvent ev = createEvent(MonitoringEventType.FOCUS_LOST, now.plusMinutes(1), 10000);
        
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.singletonList(ev));

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals(100.0, res.getEngagementScore()); 
        assertEquals(0L, res.getAffectedDurationMs());
    }
    
    @Test
    void test11_MonitoringUnavailable() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = now.minusMinutes(5); // 300,000 ms total
        MonitoringSession s = createSession(1L, start);

        // Unavailable for 4.5 minutes (270,000 ms). Available window = 30,000 ms (< 20%)
        MonitoringEvent ev = createEvent(MonitoringEventType.MONITOR_UNAVAILABLE, start, 270000);
        
        when(sessionRepo.findById(1L)).thenReturn(Optional.of(s));
        when(eventRepo.findByMonitoringSessionId(1L)).thenReturn(Collections.singletonList(ev));

        EngagementScoreDto res = scoringService.calculateEngagementAtTime(1L, now);
        assertEquals("INSUFFICIENT_DATA", res.getEngagementStatus());
        assertNull(res.getEngagementScore());
        assertTrue(res.getReasonCodes().contains("LOW_MONITORING_COVERAGE"));
    }

    @Test
    void test12_NonexistentSession() {
        when(sessionRepo.findById(99L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> {
            scoringService.calculateEngagementAtTime(99L, LocalDateTime.now());
        });
    }
}
