package com.example.demo.dto;

import lombok.Data;

@Data
public class ContentIngestionRequest {
    private Long courseId;
    private Long conceptId;
    private String title;
    private String youtubeUrl;
    private String transcript; // The raw text extracted from the video
    private Integer numQuestions; // Number of questions to generate
}
