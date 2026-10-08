package com.example.demo.service;

import com.example.demo.dto.EngagementScoreDto;
import com.example.demo.dto.LearnerStateDto;
import com.example.demo.model.Attempt;
import com.example.demo.model.LearnerMastery;
import com.example.demo.repository.AttemptRepository;
import com.example.demo.repository.LearnerMasteryRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearnerStateService {

    private final AttemptRepository attemptRepository;
    private final LearnerMasteryRepository learnerMasteryRepository;
    private final EngagementScoringService engagementScoringService;
    private final com.example.demo.repository.MonitoringSessionRepository monitoringSessionRepository;

    public LearnerStateService(AttemptRepository attemptRepository, 
                               LearnerMasteryRepository learnerMasteryRepository, 
                               EngagementScoringService engagementScoringService,
                               com.example.demo.repository.MonitoringSessionRepository monitoringSessionRepository) {
        this.attemptRepository = attemptRepository;
        this.learnerMasteryRepository = learnerMasteryRepository;
        this.engagementScoringService = engagementScoringService;
        this.monitoringSessionRepository = monitoringSessionRepository;
    }

    public LearnerStateDto evaluateState(Long userId, Long sessionId, Long conceptId) {
        LearnerStateDto state = new LearnerStateDto();
        state.setUserId(userId);
        state.setSessionId(sessionId);
        state.setConceptId(conceptId);
        state.setScoreExplanations(new HashMap<>());

        // 1. Mastery & Understanding
        if (conceptId != null) {
            learnerMasteryRepository.findByUserIdAndConceptId(userId, conceptId).ifPresent(mastery -> {
                double currentScore = mastery.getCurrentScore() != null ? mastery.getCurrentScore() : 0.0;
                // Treat currentScore directly as mastery/understanding on a 1-100 scale if it's already 0-100.
                // Assuming it's 0-100 based on AdaptiveEngineService where 40-75 are the thresholds.
                state.setMastery(currentScore);
                state.setUnderstanding(currentScore); // Could differentiate if we had detailed sub-metrics
                state.getScoreExplanations().put("Mastery", "Calculated via Exponential Moving Average from past attempts.");
            });
        }

        // Progress Calculation: Average mastery across all encountered concepts
        if (userId != null) {
            List<LearnerMastery> masteries = learnerMasteryRepository.findByUserId(userId);
            if (masteries != null && !masteries.isEmpty()) {
                double totalScore = masteries.stream()
                    .mapToDouble(m -> m.getCurrentScore() != null ? m.getCurrentScore() : 0.0)
                    .sum();
                double avgProgress = totalScore / masteries.size();
                state.setProgress(avgProgress);
                state.getScoreExplanations().put("Progress", "Calculated as the average mastery score (" + String.format("%.1f", avgProgress) + ") across " + masteries.size() + " encountered concept(s).");
            } else {
                state.setProgress(null);
                state.getScoreExplanations().put("Progress", "INSUFFICIENT_DATA. No concept mastery records found to calculate overall progress.");
            }
        }

        // 2. Monitoring (Engagement & Integrity)
        Long activeSessionId = sessionId;
        if (activeSessionId == null && userId != null) {
            activeSessionId = monitoringSessionRepository.findFirstByUserIdOrderByStartedAtDesc(userId)
                .map(com.example.demo.model.MonitoringSession::getId)
                .orElse(null);
        }

        if (activeSessionId != null) {
            try {
                EngagementScoreDto engagement = engagementScoringService.calculateEngagementAtTime(activeSessionId, java.time.LocalDateTime.now());
                state.setEngagement(engagement.getEngagementScore());
                state.setMonitoringCoverage(engagement.getMonitoringCoverage());
                
                // Integrity Risk Signal mapping
                if ("INSUFFICIENT_DATA".equals(engagement.getEngagementStatus())) {
                    state.setIntegrityRiskSignal("LOW");
                } else {
                    List<String> reasons = engagement.getReasonCodes();
                    if (reasons != null && (reasons.contains("REPEATED_FACE_ABSENCE") || reasons.contains("SUSTAINED_FOCUS_LOSS"))) {
                        // We do NOT say "CHEATING". We use "VERIFY_REVIEW" or "HIGH" risk.
                        state.setIntegrityRiskSignal("VERIFY_REVIEW");
                        state.getScoreExplanations().put("IntegrityRisk", "Repeated absence or focus loss triggered review condition.");
                    } else if ("LOW".equals(engagement.getEngagementStatus())) {
                        state.setIntegrityRiskSignal("MEDIUM");
                    } else {
                        state.setIntegrityRiskSignal("LOW");
                    }
                }
                state.getScoreExplanations().put("Engagement", engagement.getScoringExplanation());
            } catch (Exception e) {
                // Session might not exist or error in engagement calculation
                state.setMonitoringCoverage("0%");
                state.setIntegrityRiskSignal("LOW");
            }
        } else {
            state.setMonitoringCoverage("0%");
            state.setIntegrityRiskSignal("LOW");
        }

        // 3. Assessment Behavior & Practical Ability
        // Fetch recent attempts for this user (could filter by conceptId if desired)
        List<Attempt> allAttempts = attemptRepository.findAll().stream()
                .filter(a -> a.getUser() != null && a.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        
        if (!allAttempts.isEmpty()) {
            // Assessment Behavior based on recent answers
            long recentWrong = allAttempts.stream()
                    .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                    .limit(3)
                    .filter(a -> a.getScore() != null && a.getScore() < 50.0)
                    .count();
            
            if (recentWrong >= 2) {
                state.setAssessmentBehavior("STRUGGLING");
                state.getScoreExplanations().put("AssessmentBehavior", "User answered incorrectly in recent consecutive questions.");
            } else {
                state.setAssessmentBehavior("CONSISTENT");
            }

            // Practical Ability (if type is CODING)
            List<Attempt> codingAttempts = allAttempts.stream()
                    .filter(a -> a.getType() != null && "CODING".equals(a.getType().name()))
                    .collect(Collectors.toList());
            if (!codingAttempts.isEmpty()) {
                double avgCoding = codingAttempts.stream()
                        .mapToDouble(a -> a.getScore() != null ? a.getScore() : 0.0)
                        .average().orElse(0.0);
                state.setPracticalAbility(avgCoding);
                state.getScoreExplanations().put("PracticalAbility", "Average score of hands-on coding tasks.");
            }
        } else {
            state.setAssessmentBehavior("UNKNOWN");
        }

        return state;
    }
}
