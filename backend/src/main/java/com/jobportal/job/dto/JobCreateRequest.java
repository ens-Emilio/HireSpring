package com.jobportal.job.dto;

import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class JobCreateRequest {
    @NotBlank(message = "Company ID is required")
    private String companyId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private List<String> requirements;
    private List<String> benefits;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @NotNull(message = "Job level is required")
    private JobLevel level;

    private String location;
    private boolean remote;
    private boolean hybrid;
    private Integer salaryMin;
    private Integer salaryMax;
    private String currency;
    private JobStatus status = JobStatus.ACTIVE;
}
