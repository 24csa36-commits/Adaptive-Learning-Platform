package com.example.demo.dto;

import lombok.Data;

@Data
public class InterviewEvaluateRequest {
    private String courseTitle;
    private String targetRole;
    private String fullTranscript;
}
