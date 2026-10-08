package com.example.demo.service;

import com.example.demo.model.Attempt;
import com.example.demo.model.ItemConcept;
import com.example.demo.model.LearnerMastery;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MasteryEngine {

    private static final double BASE_ALPHA = 0.3; // Base learning rate for EMA

    /**
     * Updates the LearnerMastery score using an Exponential Moving Average (EMA).
     * 
     * @param currentMastery The current mastery record (can be new)
     * @param attempt The recent attempt data
     * @param itemConcepts The concepts linked to this attempt's learning item, with weights
     * @return The updated LearnerMastery object
     */
    public LearnerMastery updateMastery(LearnerMastery currentMastery, Attempt attempt, List<ItemConcept> itemConcepts) {
        if (currentMastery == null) {
            currentMastery = new LearnerMastery();
            currentMastery.setCurrentScore(0.0);
            currentMastery.setEvidenceCount(0);
        }

        double oldScore = currentMastery.getCurrentScore() == null ? 0.0 : currentMastery.getCurrentScore();
        double attemptScore = attempt.getScore() != null ? attempt.getScore() : 0.0;
        
        // Find the weight of this specific concept being updated
        double conceptWeight = 1.0;
        if (itemConcepts != null) {
            for (ItemConcept ic : itemConcepts) {
                if (ic.getConcept() != null && currentMastery.getConcept() != null &&
                    ic.getConcept().getId().equals(currentMastery.getConcept().getId())) {
                    conceptWeight = ic.getWeight() != null ? ic.getWeight() : 1.0;
                    break;
                }
            }
        }

        // Adjust score based on hints or multiple attempts (penalty)
        if (attempt.getHintsUsed() != null && attempt.getHintsUsed() > 0) {
            attemptScore *= 0.8; // 20% penalty for using hints
        }
        if (attempt.getAttemptNumber() != null && attempt.getAttemptNumber() > 1) {
            attemptScore *= Math.pow(0.9, attempt.getAttemptNumber() - 1); // 10% penalty per extra attempt
        }

        // Calculate dynamic alpha based on concept weight and item difficulty
        double difficulty = attempt.getDifficulty() != null ? attempt.getDifficulty() : 0.5;
        double alpha = BASE_ALPHA * conceptWeight * (1.0 + difficulty) / 2.0;
        
        // Ensure alpha stays within reasonable bounds [0, 1]
        alpha = Math.max(0.05, Math.min(alpha, 0.9));

        // EMA Formula: NewScore = (1 - alpha) * OldScore + alpha * EvidenceScore
        double newScore = (1 - alpha) * oldScore + alpha * attemptScore;

        currentMastery.setCurrentScore(newScore);
        currentMastery.setLastEvidenceAt(attempt.getTimestamp() != null ? attempt.getTimestamp() : LocalDateTime.now());
        currentMastery.setEvidenceCount((currentMastery.getEvidenceCount() != null ? currentMastery.getEvidenceCount() : 0) + 1);

        return currentMastery;
    }
}
