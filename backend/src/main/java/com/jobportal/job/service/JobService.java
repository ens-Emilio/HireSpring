package com.jobportal.job.service;

import com.jobportal.common.exception.ForbiddenException;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
import com.jobportal.company.entity.Company;
import com.jobportal.company.repository.CompanyRepository;
import com.jobportal.job.dto.JobCreateRequest;
import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.JobUpdateRequest;
import com.jobportal.job.entity.*;
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
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public Page<JobResponse> getAllJobs(Pageable pageable) {
        return jobRepository.findByStatus(JobStatus.ACTIVE, pageable).map(DtoMapper::toJobResponse);
    }

    public Page<JobResponse> searchJobs(String search, Boolean remote, JobType jobType, JobLevel level, Pageable pageable) {
        return jobRepository.searchJobs(search, remote, jobType, level, pageable).map(DtoMapper::toJobResponse);
    }

    public JobResponse getJobById(String id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        jobRepository.incrementViewCount(id);
        return DtoMapper.toJobResponse(job);
    }

    @Transactional
    public JobResponse createJob(String recruiterId, JobCreateRequest request) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        Job job = Job.builder()
                .company(company)
                .recruiter(recruiter)
                .title(request.getTitle())
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .jobType(request.getJobType())
                .level(request.getLevel())
                .location(request.getLocation())
                .isRemote(request.isRemote())
                .isHybrid(request.isHybrid())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .currency(request.getCurrency())
                .status(request.getStatus() != null ? request.getStatus() : JobStatus.ACTIVE)
                .build();

        log.info("Job created: {} by recruiter {}", job.getTitle(), recruiter.getEmail());
        return DtoMapper.toJobResponse(jobRepository.save(job));
    }

    @Transactional
    public JobResponse updateJob(String jobId, String recruiterId, JobUpdateRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new ForbiddenException("You can only update your own jobs");
        }

        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());
        if (request.getJobType() != null) job.setJobType(request.getJobType());
        if (request.getLevel() != null) job.setLevel(request.getLevel());
        if (request.getLocation() != null) job.setLocation(request.getLocation());
        if (request.getRemote() != null) job.setRemote(request.getRemote());
        if (request.getHybrid() != null) job.setHybrid(request.getHybrid());
        if (request.getSalaryMin() != null) job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null) job.setSalaryMax(request.getSalaryMax());
        if (request.getStatus() != null) job.setStatus(request.getStatus());

        log.info("Job updated: {} by recruiter {}", job.getTitle(), recruiterId);
        return DtoMapper.toJobResponse(jobRepository.save(job));
    }

    @Transactional
    public void deleteJob(String jobId, String recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new ForbiddenException("You can only delete your own jobs");
        }

        log.info("Job deleted: {} by recruiter {}", job.getTitle(), recruiterId);
        jobRepository.deleteById(jobId);
    }

    public long getActiveJobCount() {
        return jobRepository.countByStatus(JobStatus.ACTIVE);
    }
}
