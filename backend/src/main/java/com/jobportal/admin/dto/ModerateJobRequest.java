package com.jobportal.admin.dto;

import com.jobportal.job.entity.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModerateJobRequest {
    @NotNull(message = "Status is required")
    private JobStatus status;
}
