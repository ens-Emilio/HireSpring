package com.jobportal.job.service;

import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
import com.jobportal.job.dto.JobAlertRequest;
import com.jobportal.job.dto.JobAlertResponse;
import com.jobportal.job.entity.JobAlert;
import com.jobportal.job.entity.JobAlert.Frequency;
import com.jobportal.job.repository.JobAlertRepository;
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
public class JobAlertService {

    private final JobAlertRepository jobAlertRepository;
    private final UserRepository userRepository;

    public Page<JobAlertResponse> getUserAlerts(String userId, Pageable pageable) {
        return jobAlertRepository.findByUserId(userId, pageable).map(DtoMapper::toJobAlertResponse);
    }

    @Transactional
    public JobAlertResponse createAlert(String userId, JobAlertRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        JobAlert alert = new JobAlert();
        alert.setUser(user);
        alert.setKeywords(request.getKeywords());
        alert.setLocation(request.getLocation());
        alert.setJobType(request.getJobType());
        alert.setRemote(request.isRemote());
        alert.setFrequency(request.getFrequency() != null ? request.getFrequency() : Frequency.DAILY);

        log.info("Job alert configured for user {}: keywords={}, location={}, remote={}",
                user.getEmail(), alert.getKeywords(), alert.getLocation(), alert.isRemote());

        return DtoMapper.toJobAlertResponse(jobAlertRepository.save(alert));
    }

    @Transactional
    public void deleteAlert(String alertId, String userId) {
        JobAlert alert = jobAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        if (!alert.getUser().getId().equals(userId)) {
            throw new com.jobportal.common.exception.ForbiddenException("You can only delete your own alerts");
        }
        jobAlertRepository.deleteById(alertId);
    }
}
