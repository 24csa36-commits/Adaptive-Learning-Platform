package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "adaptive.monitoring")
@Data
public class MonitoringProperties {
    // These are prototype values and must be tunable during pilot testing
    private long faceAbsenceThresholdMs = 5000;
    private long focusLossThresholdMs = 3000;
    private long inactivityThresholdMs = 30000;
    private long engagementWindowMs = 300000;
    private int engagementThresholdPercent = 60; // Defines High
    private int engagementMediumThresholdPercent = 30; // Defines Medium
}
