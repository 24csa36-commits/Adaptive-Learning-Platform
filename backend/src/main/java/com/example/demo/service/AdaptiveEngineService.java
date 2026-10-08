package com.example.demo.service;

import com.example.demo.dto.QuizNextRequest;
import org.springframework.stereotype.Service;

@Service
public class AdaptiveEngineService {

    /**
     * This is our custom Knowledge Tracing Algorithm.
     * It mathematically calculates the student's mastery and controls the AI.
     */
    public double calculateNewScore(double currentScore, boolean wasCorrect) {
        System.out.println("====== RUNTIME VERIFICATION ======");
        System.out.println("calculateNewScore received currentScore: " + currentScore + " | wasCorrect: " + wasCorrect);
        double newScore = currentScore;
        if (wasCorrect) {
            newScore += (100.0 - newScore) * 0.2; 
        } else {
            newScore -= 15.0; 
            if (newScore < 0) newScore = 0;
        }
        System.out.println("calculateNewScore returning newScore: " + newScore);
        return newScore;
    }

    public String buildInstruction(double newScore) {
        System.out.println("buildInstruction received newScore: " + newScore);
        String difficultyTarget;
        String instruction;

        if (newScore < 40.0) {
            difficultyTarget = "BEGINNER";
            instruction = "The student is struggling. Generate a very basic, fundamental question to rebuild their confidence.";
        } else if (newScore < 75.0) {
            difficultyTarget = "INTERMEDIATE";
            instruction = "The student has basic knowledge. Generate a standard scenario-based question.";
        } else {
            difficultyTarget = "ADVANCED";
            instruction = "The student is mastering this topic! Generate a highly complex, edge-case question (Google/Meta interview level).";
        }

        return String.format("Current Mastery: %.1f. Difficulty Target: %s. Instruction: %s", 
                newScore, difficultyTarget, instruction);
    }

    public String determineNextStep(QuizNextRequest req) {
        double newScore = calculateNewScore(req.getCurrentMasteryScore(), req.isWasCorrect());
        return buildInstruction(newScore);
    }
}