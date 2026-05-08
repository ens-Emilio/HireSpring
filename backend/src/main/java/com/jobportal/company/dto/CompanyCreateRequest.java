package com.jobportal.company.dto;

import com.jobportal.company.entity.CompanySize;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyCreateRequest {
    @NotBlank(message = "Company name is required")
    private String name;

    private String website;
    private String description;
    private String industry;
    private String location;
    private CompanySize size;

    private String recruiterName;
    private String position;
}
