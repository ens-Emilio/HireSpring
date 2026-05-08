package com.jobportal.admin.service;

import com.jobportal.admin.dto.ModerateJobRequest;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public Map<String, Object> getStats() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "activeJobs", jobRepository.countByStatus(JobStatus.ACTIVE),
                "totalCompanies", jobRepository.countDistinctCompanies()
        );
    }

    public Page<JobResponse> getAllJobs(Pageable pageable) {
        return jobRepository.findAll(pageable).map(DtoMapper::toJobResponse);
    }

    @Transactional
    public JobResponse moderateJob(String jobId, ModerateJobRequest request) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        job.setStatus(request.getStatus());
        log.info("Job {} moderated to status {}", jobId, request.getStatus());
        return DtoMapper.toJobResponse(jobRepository.save(job));
    }
}
