package com.jobportal.common.mapper;

import com.jobportal.application.dto.ApplicationResponse;
import com.jobportal.application.entity.Application;
import com.jobportal.candidate.dto.CandidateProfileResponse;
import com.jobportal.candidate.entity.CandidateProfile;
import com.jobportal.company.dto.CompanyResponse;
import com.jobportal.company.entity.Company;
import com.jobportal.job.dto.JobAlertResponse;
import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.SavedJobResponse;
import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.JobAlert;
import com.jobportal.job.entity.SavedJob;
import com.jobportal.notification.dto.NotificationResponse;
import com.jobportal.notification.entity.Notification;

public class DtoMapper {

    private DtoMapper() {}

    public static JobResponse toJobResponse(Job job) {
        JobResponse r = new JobResponse();
        r.setId(job.getId());
        r.setTitle(job.getTitle());
        r.setDescription(job.getDescription());
        r.setRequirements(job.getRequirements());
        r.setBenefits(job.getBenefits());
        r.setJobType(job.getJobType());
        r.setLevel(job.getLevel());
        r.setLocation(job.getLocation());
        r.setRemote(job.isRemote());
        r.setHybrid(job.isHybrid());
        r.setSalaryMin(job.getSalaryMin());
        r.setSalaryMax(job.getSalaryMax());
        r.setCurrency(job.getCurrency());
        r.setStatus(job.getStatus());
        r.setExpiresAt(job.getExpiresAt());
        r.setViewCount(job.getViewCount());
        r.setApplicationCount(job.getApplicationCount());
        r.setCreatedAt(job.getCreatedAt());
        if (job.getCompany() != null) {
            r.setCompanyId(job.getCompany().getId());
            r.setCompanyName(job.getCompany().getName());
            r.setCompanyLogoUrl(job.getCompany().getLogoUrl());
            r.setCompanyIndustry(job.getCompany().getIndustry());
            r.setCompanyLocation(job.getCompany().getLocation());
        }
        if (job.getRecruiter() != null) {
            r.setRecruiterId(job.getRecruiter().getId());
            r.setRecruiterEmail(job.getRecruiter().getEmail());
        }
        return r;
    }

    public static CompanyResponse toCompanyResponse(Company company) {
        CompanyResponse r = new CompanyResponse();
        r.setId(company.getId());
        r.setName(company.getName());
        r.setLogoUrl(company.getLogoUrl());
        r.setWebsite(company.getWebsite());
        r.setDescription(company.getDescription());
        r.setSize(company.getSize());
        r.setIndustry(company.getIndustry());
        r.setLocation(company.getLocation());
        r.setVerified(company.isVerified());
        r.setCreatedAt(company.getCreatedAt());
        return r;
    }

    public static ApplicationResponse toApplicationResponse(Application app) {
        ApplicationResponse r = new ApplicationResponse();
        r.setId(app.getId());
        r.setResumeUrl(app.getResumeUrl());
        r.setCoverLetter(app.getCoverLetter());
        r.setStatus(app.getStatus());
        r.setPipelineStage(app.getPipelineStage());
        r.setNotes(app.getNotes());
        r.setAppliedAt(app.getAppliedAt());
        if (app.getJob() != null) {
            r.setJobId(app.getJob().getId());
            r.setJobTitle(app.getJob().getTitle());
        }
        if (app.getCandidate() != null) {
            r.setCandidateId(app.getCandidate().getId());
            r.setCandidateName(app.getCandidate().getEmail());
        }
        return r;
    }

    public static CandidateProfileResponse toCandidateProfileResponse(CandidateProfile profile) {
        CandidateProfileResponse r = new CandidateProfileResponse();
        r.setId(profile.getId());
        r.setFullName(profile.getFullName());
        r.setHeadline(profile.getHeadline());
        r.setBio(profile.getBio());
        r.setLocation(profile.getLocation());
        r.setSalaryExpectation(profile.getSalaryExpectation());
        r.setCurrency(profile.getCurrency());
        r.setSkills(profile.getSkills());
        r.setExperience(profile.getExperience());
        r.setEducation(profile.getEducation());
        r.setResumeUrl(profile.getResumeUrl());
        r.setAvatarUrl(profile.getAvatarUrl());
        r.setRemote(profile.isRemote());
        r.setJobTypes(profile.getJobTypes());
        r.setCreatedAt(profile.getCreatedAt());
        if (profile.getUser() != null) {
            r.setUserId(profile.getUser().getId());
        }
        return r;
    }

    public static NotificationResponse toNotificationResponse(Notification notification) {
        NotificationResponse r = new NotificationResponse();
        r.setId(notification.getId());
        r.setTitle(notification.getTitle());
        r.setMessage(notification.getMessage());
        r.setRead(notification.isRead());
        r.setCreatedAt(notification.getCreatedAt());
        return r;
    }

    public static SavedJobResponse toSavedJobResponse(SavedJob saved) {
        SavedJobResponse r = new SavedJobResponse();
        r.setId(saved.getId());
        r.setCreatedAt(saved.getCreatedAt());
        if (saved.getJob() != null) {
            r.setJobId(saved.getJob().getId());
            r.setJobTitle(saved.getJob().getTitle());
            r.setJobLocation(saved.getJob().getLocation());
            if (saved.getJob().getCompany() != null) {
                r.setCompanyName(saved.getJob().getCompany().getName());
            }
        }
        return r;
    }

    public static JobAlertResponse toJobAlertResponse(JobAlert alert) {
        JobAlertResponse r = new JobAlertResponse();
        r.setId(alert.getId());
        r.setKeywords(alert.getKeywords());
        r.setLocation(alert.getLocation());
        r.setJobType(alert.getJobType());
        r.setRemote(alert.isRemote());
        r.setFrequency(alert.getFrequency() != null ? alert.getFrequency().name() : null);
        r.setLastSentAt(alert.getLastSentAt());
        r.setCreatedAt(alert.getCreatedAt());
        return r;
    }
}
