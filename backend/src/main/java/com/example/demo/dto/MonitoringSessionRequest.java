package com.example.demo.dto;

import lombok.Data;

@Data
public class MonitoringSessionRequest {
    private Long userId;
    private Long courseId;
    private Long lessonId;
    private String context; // LEARNING, ASSESSMENT
}
