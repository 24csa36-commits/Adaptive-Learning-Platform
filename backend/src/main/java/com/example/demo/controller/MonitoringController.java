package com.example.demo.controller;

import com.example.demo.dto.MonitoringBatchRequest;
import com.example.demo.dto.MonitoringSessionRequest;
import com.example.demo.model.MonitoringSession;
import com.example.demo.service.MonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
@CrossOrigin(origins = "http://localhost:5173")
public class MonitoringController {

    private final MonitoringService monitoringService;
    private final com.example.demo.service.EngagementScoringService scoringService;

    public MonitoringController(MonitoringService monitoringService, com.example.demo.service.EngagementScoringService scoringService) {
        this.monitoringService = monitoringService;
        this.scoringService = scoringService;
    }

    @GetMapping("/sessions/{sessionId}/engagement")
    public ResponseEntity<?> getEngagement(@PathVariable Long sessionId) {
        try {
            return ResponseEntity.ok(scoringService.calculateEngagement(sessionId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Failed to calculate engagement"));
        }
    }

    @PostMapping("/sessions")
    public ResponseEntity<?> startSession(@RequestBody MonitoringSessionRequest request) {
        try {
            MonitoringSession session = monitoringService.createSession(
                request.getUserId(),
                request.getCourseId(),
                request.getLessonId(),
                request.getContext() != null ? request.getContext() : "LEARNING"
            );
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            // Failure must be safe - do not block learning
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Monitoring temporarily unavailable"));
        }
    }
    
    @PostMapping("/sessions/{sessionId}/close")
    public ResponseEntity<?> closeSession(@PathVariable Long sessionId) {
        try {
            MonitoringSession session = monitoringService.closeSession(sessionId);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/events")
    public ResponseEntity<?> ingestEvents(@RequestBody MonitoringBatchRequest request) {
        try {
            monitoringService.ingestEvents(request);
            return ResponseEntity.ok(Collections.singletonMap("status", "success"));
        } catch (IllegalArgumentException e) {
            // e.g. Session not found
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            // Failure must be safe
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Failed to ingest events"));
        }
    }
}
