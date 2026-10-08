package com.example.demo.service;

import com.example.demo.config.MonitoringProperties;
import com.example.demo.dto.EngagementScoreDto;
import com.example.demo.model.MonitoringEvent;
import com.example.demo.model.MonitoringEventType;
import com.example.demo.model.MonitoringSession;
import com.example.demo.repository.MonitoringEventRepository;
import com.example.demo.repository.MonitoringSessionRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EngagementScoringService {

    private final MonitoringSessionRepository sessionRepository;
    private final MonitoringEventRepository eventRepository;
    private final MonitoringProperties properties;

    public EngagementScoringService(MonitoringSessionRepository sessionRepository,
                                    MonitoringEventRepository eventRepository,
                                    MonitoringProperties properties) {
        this.sessionRepository = sessionRepository;
        this.eventRepository = eventRepository;
        this.properties = properties;
    }

    public EngagementScoreDto calculateEngagement(Long sessionId) {
        return calculateEngagementAtTime(sessionId, LocalDateTime.now());
    }

    // Exposed for deterministic testing
    public EngagementScoreDto calculateEngagementAtTime(Long sessionId, LocalDateTime evaluationTime) {
        MonitoringSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        EngagementScoreDto dto = new EngagementScoreDto();
        dto.setSessionId(sessionId);
        dto.setMonitoringCoverage(session.getMonitoringCoverage());

        // 1. Determine Window
        LocalDateTime windowEnd = evaluationTime;
        if (session.getEndedAt() != null && session.getEndedAt().isBefore(windowEnd)) {
            windowEnd = session.getEndedAt();
        }

        LocalDateTime windowStart = windowEnd.minus(Duration.ofMillis(properties.getEngagementWindowMs()));
        if (session.getStartedAt().isAfter(windowStart)) {
            windowStart = session.getStartedAt();
        }

        dto.setWindowStart(windowStart);
        dto.setWindowEnd(windowEnd);

        long windowDurationMs = Duration.between(windowStart, windowEnd).toMillis();

        // If window is extremely small or negative, return insufficient data
        if (windowDurationMs <= 0) {
            return buildInsufficientData(dto, "Window duration is zero or negative.");
        }

        // 2. Fetch and filter events
        List<MonitoringEvent> allEvents = eventRepository.findByMonitoringSessionId(sessionId);
        
        List<Interval> penaltyIntervals = new ArrayList<>();
        List<Interval> unavailableIntervals = new ArrayList<>();
        Map<String, Long> breakdown = new HashMap<>();
        List<String> reasons = new ArrayList<>();

        for (MonitoringEvent event : allEvents) {
            LocalDateTime eStart = event.getStartTimestamp();
            if (eStart.isAfter(windowEnd)) continue; // Future event relative to window

            LocalDateTime eEnd = eStart.plus(Duration.ofMillis(event.getDurationMs()));
            if (eEnd.isBefore(windowStart)) continue; // Past event relative to window

            // Clip to window
            LocalDateTime actualStart = eStart.isBefore(windowStart) ? windowStart : eStart;
            LocalDateTime actualEnd = eEnd.isAfter(windowEnd) ? windowEnd : eEnd;
            long actualDurationMs = Duration.between(actualStart, actualEnd).toMillis();

            if (actualDurationMs <= 0) continue;

            MonitoringEventType type = event.getEventType();
            
            // Check thresholds
            boolean applyPenalty = false;
            
            if (type == MonitoringEventType.MONITOR_UNAVAILABLE) {
                unavailableIntervals.add(new Interval(actualStart, actualEnd));
                breakdown.merge(type.name(), actualDurationMs, Long::sum);
            } else if (type == MonitoringEventType.FACE_ABSENT && event.getDurationMs() >= properties.getFaceAbsenceThresholdMs()) {
                applyPenalty = true;
            } else if (type == MonitoringEventType.FOCUS_LOST && event.getDurationMs() >= properties.getFocusLossThresholdMs()) {
                applyPenalty = true;
            } else if (type == MonitoringEventType.INACTIVE && event.getDurationMs() >= properties.getInactivityThresholdMs()) {
                applyPenalty = true;
            }

            if (applyPenalty) {
                penaltyIntervals.add(new Interval(actualStart, actualEnd));
                breakdown.merge(type.name(), actualDurationMs, Long::sum);
            }
        }

        // 3. Handle Unavailability & Insufficient Data
        long totalUnavailableMs = mergeIntervals(unavailableIntervals);
        long availableWindowMs = windowDurationMs - totalUnavailableMs;

        // The minimum required observation time is 20% of the CONFIGURED engagement window,
        // regardless of how old the session is.
        long minRequiredObservedMs = (long) (properties.getEngagementWindowMs() * 0.20);

        if (availableWindowMs < minRequiredObservedMs) {
            dto.setMonitoringCoverage(windowDurationMs > 0 ? String.format("%.0f%%", ((double)availableWindowMs / windowDurationMs) * 100) : "0%");
            reasons.add("LOW_MONITORING_COVERAGE");
            dto.setReasonCodes(reasons);
            return buildInsufficientData(dto, "Insufficient observation history (" + availableWindowMs + " ms). Requires at least " + minRequiredObservedMs + " ms.");
        }

        dto.setMonitoringCoverage(String.format("%.0f%%", ((double)availableWindowMs / windowDurationMs) * 100));

        // 4. Merge overlapping penalties
        long totalPenaltyMs = mergeIntervals(penaltyIntervals);
        // Penalty cannot exceed the available window
        if (totalPenaltyMs > availableWindowMs) {
            totalPenaltyMs = availableWindowMs;
        }

        // 5. Calculate Score
        double score = 100.0 * (1.0 - ((double) totalPenaltyMs / availableWindowMs));
        score = Math.max(0.0, Math.min(100.0, score));

        dto.setEngagementScore(score);
        dto.setAffectedDurationMs(totalPenaltyMs);
        dto.setSignalBreakdown(breakdown);

        if (score >= properties.getEngagementThresholdPercent()) {
            dto.setEngagementStatus("HIGH");
        } else if (score >= properties.getEngagementMediumThresholdPercent()) {
            dto.setEngagementStatus("MEDIUM");
            reasons.add("LOW_ENGAGEMENT");
        } else {
            dto.setEngagementStatus("LOW");
            reasons.add("LOW_ENGAGEMENT");
        }

        // Generate specific reasons
        if (breakdown.getOrDefault("FACE_ABSENT", 0L) > properties.getFaceAbsenceThresholdMs() * 2) {
            reasons.add("REPEATED_FACE_ABSENCE");
        }
        if (breakdown.getOrDefault("FOCUS_LOST", 0L) > properties.getFocusLossThresholdMs() * 3) {
            reasons.add("SUSTAINED_FOCUS_LOSS");
        }
        if (breakdown.getOrDefault("INACTIVE", 0L) > properties.getInactivityThresholdMs() * 2) {
            reasons.add("PROLONGED_INACTIVITY");
        }

        dto.setReasonCodes(reasons);
        dto.setScoringExplanation(String.format("Penalized %d ms out of %d ms available window.", totalPenaltyMs, availableWindowMs));

        return dto;
    }

    private EngagementScoreDto buildInsufficientData(EngagementScoreDto dto, String explanation) {
        dto.setEngagementStatus("INSUFFICIENT_DATA");
        dto.setEngagementScore(null);
        dto.setAffectedDurationMs(0L);
        dto.setSignalBreakdown(new HashMap<>());
        
        List<String> reasons = dto.getReasonCodes() != null ? new ArrayList<>(dto.getReasonCodes()) : new ArrayList<>();
        reasons.add("INSUFFICIENT_DATA");
        dto.setReasonCodes(reasons);
        dto.setScoringExplanation(explanation);
        return dto;
    }

    private long mergeIntervals(List<Interval> intervals) {
        if (intervals.isEmpty()) return 0L;
        intervals.sort(Comparator.comparing(Interval::getStart));

        long totalMs = 0;
        LocalDateTime currentStart = intervals.get(0).getStart();
        LocalDateTime currentEnd = intervals.get(0).getEnd();

        for (int i = 1; i < intervals.size(); i++) {
            Interval next = intervals.get(i);
            if (!next.getStart().isAfter(currentEnd)) {
                // Overlap
                if (next.getEnd().isAfter(currentEnd)) {
                    currentEnd = next.getEnd();
                }
            } else {
                // No overlap, add previous
                totalMs += Duration.between(currentStart, currentEnd).toMillis();
                currentStart = next.getStart();
                currentEnd = next.getEnd();
            }
        }
        totalMs += Duration.between(currentStart, currentEnd).toMillis();
        return totalMs;
    }

    private static class Interval {
        private final LocalDateTime start;
        private final LocalDateTime end;

        public Interval(LocalDateTime start, LocalDateTime end) {
            this.start = start;
            this.end = end;
        }

        public LocalDateTime getStart() { return start; }
        public LocalDateTime getEnd() { return end; }
    }
}
