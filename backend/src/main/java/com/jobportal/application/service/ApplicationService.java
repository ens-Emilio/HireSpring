package com.jobportal.application.service;

import com.jobportal.application.dto.ApplicationResponse;
import com.jobportal.application.dto.UpdateStageRequest;
import com.jobportal.application.entity.Application;
import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.repository.ApplicationRepository;
import com.jobportal.candidate.entity.CandidateProfile;
import com.jobportal.candidate.repository.CandidateProfileRepository;
import com.jobportal.common.exception.BusinessException;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
import com.jobportal.job.entity.Job;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    @Transactional
    public ApplicationResponse applyToJob(String candidateId, String jobId, String coverLetter) {
        if (applicationRepository.existsByCandidateIdAndJobId(candidateId, jobId)) {
            throw new BusinessException("Already applied to this job");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found"));

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .resumeUrl(profile.getResumeUrl())
                .coverLetter(coverLetter)
                .status(ApplicationStatus.APPLIED)
                .pipelineStage(0)
                .build();

        jobRepository.incrementApplicationCount(jobId);

        log.info("New application: {} applied to job {}", candidate.getEmail(), job.getTitle());

        return DtoMapper.toApplicationResponse(applicationRepository.save(application));
    }

    public Page<ApplicationResponse> getMyApplications(String candidateId, Pageable pageable) {
        return applicationRepository.findByCandidateId(candidateId, pageable).map(DtoMapper::toApplicationResponse);
    }

    public Page<ApplicationResponse> getJobApplications(String jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable).map(DtoMapper::toApplicationResponse);
    }

    @Transactional
    public ApplicationResponse updateStage(String applicationId, UpdateStageRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        int newStage = request.getStage();
        application.setPipelineStage(newStage);
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }

        ApplicationStatus[] statuses = ApplicationStatus.values();
        if (newStage >= 0 && newStage < statuses.length) {
            application.setStatus(statuses[newStage]);
        }

        log.info("Application {} moved to stage {}: {}", applicationId, newStage, application.getStatus());

        return DtoMapper.toApplicationResponse(applicationRepository.save(application));
    }
}
