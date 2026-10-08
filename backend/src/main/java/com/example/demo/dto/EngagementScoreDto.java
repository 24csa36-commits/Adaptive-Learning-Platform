package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class EngagementScoreDto {
    private Long sessionId;
    
    // Nullable if INSUFFICIENT_DATA
    private Double engagementScore;
    
    private String engagementStatus; // e.g. HIGH, MEDIUM, LOW, INSUFFICIENT_DATA
    private String monitoringCoverage;
    
    private LocalDateTime windowStart;
    private LocalDateTime windowEnd;
    
    private Long affectedDurationMs;
    private List<String> reasonCodes;
    private Map<String, Long> signalBreakdown;
    private String scoringExplanation;
}
