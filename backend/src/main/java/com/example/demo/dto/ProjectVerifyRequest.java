package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProjectVerifyRequest {
    private String projectTitle;
    private String githubUrl;
    private String description;
    private List<String> requiredSkills;
}
