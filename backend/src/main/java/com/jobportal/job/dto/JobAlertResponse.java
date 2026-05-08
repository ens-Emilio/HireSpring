package com.jobportal.job.dto;

import com.jobportal.job.entity.JobType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobAlertResponse {
    private String id;
    private List<String> keywords;
    private String location;
    private JobType jobType;
    private boolean remote;
    private String frequency;
    private LocalDateTime lastSentAt;
    private LocalDateTime createdAt;
}
