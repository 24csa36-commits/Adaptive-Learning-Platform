package com.example.demo.dto;

import lombok.Data;

@Data
public class CodeEvaluationRequest {
    private String code;
    private String language;
    private String problemDescription;
}
