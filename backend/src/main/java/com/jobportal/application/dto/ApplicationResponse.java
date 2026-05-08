package com.jobportal.application.dto;

import com.jobportal.application.entity.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {
    private String id;
    private String jobId;
    private String jobTitle;
    private String candidateId;
    private String candidateName;
    private String resumeUrl;
    private String coverLetter;
    private ApplicationStatus status;
    private Integer pipelineStage;
    private String notes;
    private LocalDateTime appliedAt;
}
