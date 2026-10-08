package com.example.demo.service;

import com.example.demo.model.Attempt;
import com.example.demo.model.Concept;
import com.example.demo.model.ItemConcept;
import com.example.demo.model.LearnerMastery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class MasteryEngineTest {

    private MasteryEngine masteryEngine;

    @BeforeEach
    void setUp() {
        masteryEngine = new MasteryEngine();
    }

    @Test
    void testUpdateMastery_NewLearner_PerfectAttempt() {
        Concept concept = new Concept();
        concept.setId(1L);

        Attempt attempt = new Attempt();
        attempt.setScore(1.0); // 100%
        attempt.setHintsUsed(0);
        attempt.setAttemptNumber(1);
        attempt.setDifficulty(0.5);
        attempt.setTimestamp(LocalDateTime.now());

        ItemConcept ic = new ItemConcept();
        ic.setConcept(concept);
        ic.setWeight(1.0);

        LearnerMastery initialMastery = new LearnerMastery();
        initialMastery.setConcept(concept);
        initialMastery.setCurrentScore(0.0);
        initialMastery.setEvidenceCount(0);

        LearnerMastery updated = masteryEngine.updateMastery(initialMastery, attempt, Collections.singletonList(ic));

        assertNotNull(updated);
        assertEquals(1, updated.getEvidenceCount());
        assertTrue(updated.getCurrentScore() > 0.0); // Score should increase
        
        // With Base=0.3, Weight=1.0, Diff=0.5 -> alpha = 0.3 * 1.0 * (1.5/2) = 0.225
        // New = (1-0.225)*0 + 0.225*1 = 0.225
        assertEquals(0.225, updated.getCurrentScore(), 0.001);
    }

    @Test
    void testUpdateMastery_WithHintsPenalty() {
        Concept concept = new Concept();
        concept.setId(1L);

        Attempt attempt = new Attempt();
        attempt.setScore(1.0);
        attempt.setHintsUsed(1); // Should penalize
        attempt.setAttemptNumber(1);
        attempt.setDifficulty(0.5);

        ItemConcept ic = new ItemConcept();
        ic.setConcept(concept);
        ic.setWeight(1.0);

        LearnerMastery initialMastery = new LearnerMastery();
        initialMastery.setConcept(concept);
        initialMastery.setCurrentScore(0.5);

        LearnerMastery updated = masteryEngine.updateMastery(initialMastery, attempt, Collections.singletonList(ic));

        // Attempt score becomes 1.0 * 0.8 = 0.8
        // alpha = 0.225
        // New = (1-0.225)*0.5 + 0.225*0.8 = 0.3875 + 0.18 = 0.5675
        assertEquals(0.5675, updated.getCurrentScore(), 0.001);
    }
}
