package com.jobportal.job.service;

import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.repository.JobRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    @Test
    void getAllJobs_ReturnsActiveJobs() {
        Job job = Job.builder().id("job-1").title("Software Engineer").status(JobStatus.ACTIVE).build();
        Page<Job> page = new PageImpl<>(List.of(job));
        when(jobRepository.findByStatus(JobStatus.ACTIVE, PageRequest.of(0, 20))).thenReturn(page);

        Page<JobResponse> result = jobService.getAllJobs(PageRequest.of(0, 20));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Software Engineer", result.getContent().get(0).getTitle());
    }

    @Test
    void getActiveJobCount_ReturnsCorrectCount() {
        when(jobRepository.countByStatus(JobStatus.ACTIVE)).thenReturn(42L);

        long count = jobService.getActiveJobCount();

        assertEquals(42L, count);
        verify(jobRepository).countByStatus(JobStatus.ACTIVE);
    }
}
