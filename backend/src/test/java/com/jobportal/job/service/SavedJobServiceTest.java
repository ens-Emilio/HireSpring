package com.jobportal.job.service;

import com.jobportal.job.dto.SavedJobResponse;
import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.SavedJob;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.job.repository.SavedJobRepository;
import com.jobportal.user.entity.Role;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavedJobServiceTest {

    @Mock
    private SavedJobRepository savedJobRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SavedJobService savedJobService;

    private User testUser;
    private Job testJob;
    private SavedJob testSavedJob;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("candidate@test.com")
                .role(Role.CANDIDATE)
                .build();

        testJob = Job.builder()
                .id("job-1")
                .title("Software Engineer")
                .build();

        testSavedJob = SavedJob.builder()
                .id("saved-1")
                .user(testUser)
                .job(testJob)
                .build();
    }

    @Test
    void getSavedJobs_ReturnsPage() {
        Page<SavedJob> page = new PageImpl<>(List.of(testSavedJob));
        when(savedJobRepository.findByUserId(eq("user-1"), any(PageRequest.class))).thenReturn(page);

        Page<SavedJobResponse> result = savedJobService.getSavedJobs("user-1", PageRequest.of(0, 20));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Software Engineer", result.getContent().get(0).getJobTitle());
    }

    @Test
    void toggleSavedJob_SaveNew() {
        when(savedJobRepository.existsByUserIdAndJobId("user-1", "job-1")).thenReturn(false);
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(jobRepository.findById("job-1")).thenReturn(Optional.of(testJob));
        when(savedJobRepository.save(any(SavedJob.class))).thenReturn(testSavedJob);

        SavedJobResponse result = savedJobService.toggleSavedJob("user-1", "job-1");

        assertNotNull(result);
        assertEquals("Software Engineer", result.getJobTitle());
        verify(savedJobRepository).save(any(SavedJob.class));
    }

    @Test
    void toggleSavedJob_UnsaveExisting() {
        when(savedJobRepository.existsByUserIdAndJobId("user-1", "job-1")).thenReturn(true);

        SavedJobResponse result = savedJobService.toggleSavedJob("user-1", "job-1");

        assertNull(result);
        verify(savedJobRepository).deleteByUserIdAndJobId("user-1", "job-1");
        verify(savedJobRepository, never()).save(any());
    }

    @Test
    void toggleSavedJob_UserNotFound() {
        when(savedJobRepository.existsByUserIdAndJobId("user-1", "job-1")).thenReturn(false);
        when(userRepository.findById("user-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> savedJobService.toggleSavedJob("user-1", "job-1"));
    }

    @Test
    void toggleSavedJob_JobNotFound() {
        when(savedJobRepository.existsByUserIdAndJobId("user-1", "job-1")).thenReturn(false);
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(jobRepository.findById("job-1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> savedJobService.toggleSavedJob("user-1", "job-1"));
    }
}
