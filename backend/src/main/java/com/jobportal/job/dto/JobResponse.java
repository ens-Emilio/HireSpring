package com.jobportal.job.dto;

import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobResponse {
    private String id;
    private String title;
    private String description;
    private List<String> requirements;
    private List<String> benefits;
    private JobType jobType;
    private JobLevel level;
    private String location;
    private boolean remote;
    private boolean hybrid;
    private Integer salaryMin;
    private Integer salaryMax;
    private String currency;
    private JobStatus status;
    private LocalDateTime expiresAt;
    private Long viewCount;
    private Long applicationCount;
    private LocalDateTime createdAt;

    // Company info (flattened from Company entity)
    private String companyId;
    private String companyName;
    private String companyLogoUrl;
    private String companyIndustry;
    private String companyLocation;

    // Recruiter info (flattened from User entity)
    private String recruiterId;
    private String recruiterEmail;
}
