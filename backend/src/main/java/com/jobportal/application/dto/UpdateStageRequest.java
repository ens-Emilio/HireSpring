package com.jobportal.application.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateStageRequest {
    @Min(value = 0, message = "Stage must be at least 0")
    @Max(value = 4, message = "Stage must be at most 4")
    private int stage;

    private String notes;
}
