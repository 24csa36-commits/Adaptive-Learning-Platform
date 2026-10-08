package com.example.demo.dto;

import lombok.Data;

@Data
public class InterviewStartRequest {
    private String courseTitle;
    private String moduleTitle;
    private String lessonContent;
    private String difficulty;
    private String targetRole;
}
