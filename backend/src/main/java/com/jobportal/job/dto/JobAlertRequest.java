package com.jobportal.job.dto;

import com.jobportal.job.entity.JobAlert.Frequency;
import com.jobportal.job.entity.JobType;
import lombok.Data;

import java.util.List;

@Data
public class JobAlertRequest {
    private List<String> keywords;
    private String location;
    private JobType jobType;
    private boolean isRemote;
    private Frequency frequency = Frequency.DAILY;
}
