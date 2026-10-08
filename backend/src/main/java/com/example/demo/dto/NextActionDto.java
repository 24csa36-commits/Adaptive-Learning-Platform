package com.example.demo.dto;

import lombok.Data;

@Data
public class NextActionDto {
    // LEARNING, REVISE, PRACTICE, RETRY, INCREASE_DIFFICULTY, VERIFY_REVIEW, CONTINUE
    private String action;
    private String reason;
    private Long conceptId;
    private String recommendedDifficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private String source; // RULE_ENGINE
}
