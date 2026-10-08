package com.example.demo.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class InterviewReplyRequest {
    private String courseTitle;
    private String moduleTitle;
    private String initialScenario;
    private List<Map<String, String>> chatHistory;
    private String candidateLatestReply;
}
