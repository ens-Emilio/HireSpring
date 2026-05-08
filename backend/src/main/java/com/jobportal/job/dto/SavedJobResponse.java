package com.jobportal.job.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SavedJobResponse {
    private String id;
    private String jobId;
    private String jobTitle;
    private String companyName;
    private String jobLocation;
    private LocalDateTime createdAt;
}
