package com.jobportal.company.dto;

import com.jobportal.company.entity.CompanySize;
import lombok.Data;

@Data
public class CompanyUpdateRequest {
    private String name;
    private String website;
    private String description;
    private String industry;
    private String location;
    private String logoUrl;
    private CompanySize size;
}
