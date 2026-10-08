package com.example.demo.dto;

import lombok.Data;
import java.util.Map;

@Data
public class LearnerStateDto {
    private Long userId;
    private Long sessionId;
    private Long conceptId;

    // 0.0 to 1.0 (or 0-100) scores for different dimensions
    private Double understanding; 
    private Double mastery;
    private Double engagement;
    private Double progress;
    private String assessmentBehavior; // e.g. "RUSHING", "CONSISTENT", "STRUGGLING"
    private Double practicalAbility; // from code/practical tasks if present
    private String integrityRiskSignal; // "LOW", "MEDIUM", "HIGH", "VERIFY_REVIEW"
    private String monitoringCoverage; // percentage string from Phase 2
    
    private Map<String, String> scoreExplanations;
}
