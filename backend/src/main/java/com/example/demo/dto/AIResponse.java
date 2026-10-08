package com.example.demo.dto;

import lombok.Data;

@Data
public class AIResponse {
    private String response;
    
    public AIResponse() {}
    
    public AIResponse(String response) {
        this.response = response;
    }
}
