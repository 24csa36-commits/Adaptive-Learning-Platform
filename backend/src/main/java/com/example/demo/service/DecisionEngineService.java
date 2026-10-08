package com.example.demo.service;

import com.example.demo.dto.LearnerStateDto;
import com.example.demo.dto.NextActionDto;
import org.springframework.stereotype.Service;

@Service
public class DecisionEngineService {

    public NextActionDto determineNextAction(LearnerStateDto state) {
        NextActionDto action = new NextActionDto();
        action.setConceptId(state.getConceptId());
        action.setSource("RULE_ENGINE");

        // 1. Check Integrity/Monitoring limits
        if ("VERIFY_REVIEW".equals(state.getIntegrityRiskSignal())) {
            action.setAction("VERIFY_REVIEW");
            action.setReason("Integrity-risk signal crosses the defined review condition.");
            action.setRecommendedDifficulty("N/A");
            return action;
        }

        if (state.getMonitoringCoverage() != null) {
            try {
                double coverage = Double.parseDouble(state.getMonitoringCoverage().replace("%", ""));
                if (coverage < 20.0) {
                    action.setAction("CONTINUE");
                    action.setReason("Insufficient monitoring data. Cannot make a strong behavioral conclusion.");
                    action.setRecommendedDifficulty("INTERMEDIATE"); // Fallback
                    return action;
                }
            } catch (NumberFormatException e) {
                // Ignore parsing errors for coverage
            }
        }

        // Default difficulty is INTERMEDIATE
        action.setRecommendedDifficulty("INTERMEDIATE");

        // 2. Rule: If understanding is weak -> REVISE
        if (state.getUnderstanding() != null && state.getUnderstanding() < 40.0) {
            action.setAction("REVISE");
            action.setReason("Low understanding detected for this concept.");
            action.setRecommendedDifficulty("BEGINNER");
            return action;
        }

        // 3. Rule: If practical ability is weak -> PRACTICE
        if (state.getPracticalAbility() != null && state.getPracticalAbility() < 50.0) {
            action.setAction("PRACTICE");
            action.setReason("Practical ability is weak. Hands-on practice recommended.");
            return action;
        }
        
        // 4. Rule: Repeated mistakes (STRUGGLING) -> RETRY / TARGETED PRACTICE
        if ("STRUGGLING".equals(state.getAssessmentBehavior())) {
            action.setAction("RETRY"); // or TARGETED_PRACTICE
            action.setReason("Repeated incorrect responses detected for the same concept.");
            action.setRecommendedDifficulty("BEGINNER");
            return action;
        }

        // 5. Rule: Strong performance -> INCREASE_DIFFICULTY
        if (state.getMastery() != null && state.getMastery() >= 75.0) {
            action.setAction("INCREASE_DIFFICULTY");
            action.setReason("Consistent strong performance in this concept.");
            action.setRecommendedDifficulty("ADVANCED");
            return action;
        }
        
        // Default: CONTINUE
        action.setAction("CONTINUE");
        action.setReason("Learner is progressing normally.");
        
        // Derive standard difficulty from Mastery if possible
        if (state.getMastery() != null) {
            if (state.getMastery() < 40.0) {
                action.setRecommendedDifficulty("BEGINNER");
            } else if (state.getMastery() < 75.0) {
                action.setRecommendedDifficulty("INTERMEDIATE");
            } else {
                action.setRecommendedDifficulty("ADVANCED");
            }
        }

        return action;
    }
}
