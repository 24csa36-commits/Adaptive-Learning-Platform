package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private Long id;
    private String name;
    private String email;
    private String skillLevel;
    private String learningGoal;
    private Integer streak;
    private Integer overallReadiness;
}
