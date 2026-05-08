package com.jobportal.job.dto;

import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import lombok.Data;

import java.util.List;

@Data
public class JobUpdateRequest {
    private String title;
    private String description;
    private List<String> requirements;
    private List<String> benefits;
    private JobType jobType;
    private JobLevel level;
    private String location;
    private Boolean remote;
    private Boolean hybrid;
    private Integer salaryMin;
    private Integer salaryMax;
    private JobStatus status;
}
