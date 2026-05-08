package com.jobportal.company.dto;

import com.jobportal.company.entity.CompanySize;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CompanyResponse {
    private String id;
    private String name;
    private String logoUrl;
    private String website;
    private String description;
    private CompanySize size;
    private String industry;
    private String location;
    private boolean verified;
    private LocalDateTime createdAt;
}
