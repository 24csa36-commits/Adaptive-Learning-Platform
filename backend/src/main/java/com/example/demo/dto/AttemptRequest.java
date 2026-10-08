package com.example.demo.dto;

import lombok.Data;

@Data
public class AttemptRequest {
    private Long studentId; // (Hardcoded for now on frontend)
    private Double score; // 0.0 to 1.0 (e.g. 0.8 for 80%)
    private Integer hintsUsed;
    private Long timeSpentMs;
    private Double itemDifficulty; // 0.0 to 1.0
}
