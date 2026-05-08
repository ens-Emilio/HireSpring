package com.jobportal.candidate.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CandidateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    private String headline;
    private String bio;
    private String location;

    @Min(value = 0, message = "Salary expectation must be positive")
    private Integer salaryExpectation;

    private String currency;
    private List<String> skills;
    private List<Map<String, Object>> experience;
    private List<Map<String, Object>> education;
    private String resumeUrl;
    private String avatarUrl;
    private boolean remote;
    private List<String> jobTypes;
}
