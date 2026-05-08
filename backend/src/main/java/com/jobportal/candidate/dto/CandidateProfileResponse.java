package com.jobportal.candidate.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class CandidateProfileResponse {
    private String id;
    private String userId;
    private String fullName;
    private String headline;
    private String bio;
    private String location;
    private Integer salaryExpectation;
    private String currency;
    private List<String> skills;
    private List<Map<String, Object>> experience;
    private List<Map<String, Object>> education;
    private String resumeUrl;
    private String avatarUrl;
    private boolean remote;
    private List<String> jobTypes;
    private LocalDateTime createdAt;
}
