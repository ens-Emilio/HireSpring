package com.jobportal.job.service;

import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
import com.jobportal.job.dto.SavedJobResponse;
import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.SavedJob;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.job.repository.SavedJobRepository;
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
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public Page<SavedJobResponse> getSavedJobs(String userId, Pageable pageable) {
        return savedJobRepository.findByUserId(userId, pageable).map(DtoMapper::toSavedJobResponse);
    }

    @Transactional
    public SavedJobResponse toggleSavedJob(String userId, String jobId) {
        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
            return null;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

        SavedJob savedJob = SavedJob.builder()
                .user(user)
                .job(job)
                .build();

        return DtoMapper.toSavedJobResponse(savedJobRepository.save(savedJob));
    }
}
