package com.jobportal.application.service;

import com.jobportal.application.dto.ApplicationResponse;
import com.jobportal.application.entity.Application;
import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.repository.ApplicationRepository;
import com.jobportal.candidate.entity.CandidateProfile;
import com.jobportal.candidate.repository.CandidateProfileRepository;
import com.jobportal.job.entity.Job;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private User candidate;
    private Job job;
    private CandidateProfile profile;

    @BeforeEach
    void setUp() {
        candidate = User.builder().id("candidate-1").email("candidate@test.com").build();
        job = Job.builder().id("job-1").title("Software Engineer").applicationCount(0L).build();
        profile = CandidateProfile.builder().user(candidate).resumeUrl("/uploads/resumes/cv.pdf").build();
    }

    @Test
    void applyToJob_Success() {
        when(applicationRepository.existsByCandidateIdAndJobId("candidate-1", "job-1")).thenReturn(false);
        when(jobRepository.findById("job-1")).thenReturn(Optional.of(job));
        when(userRepository.findById("candidate-1")).thenReturn(Optional.of(candidate));
        when(candidateProfileRepository.findByUserId("candidate-1")).thenReturn(Optional.of(profile));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        ApplicationResponse result = applicationService.applyToJob("candidate-1", "job-1", "I am interested");

        assertNotNull(result);
        assertEquals(ApplicationStatus.APPLIED, result.getStatus());
        assertEquals(0, result.getPipelineStage());
        verify(jobRepository).incrementApplicationCount("job-1");
    }

    @Test
    void applyToJob_AlreadyApplied() {
        when(applicationRepository.existsByCandidateIdAndJobId("candidate-1", "job-1")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> applicationService.applyToJob("candidate-1", "job-1", "Cover letter"));
    }

    @Test
    void updateStage_Success() {
        Application app = Application.builder()
                .id("app-1")
                .status(ApplicationStatus.APPLIED)
                .pipelineStage(0)
                .build();

        when(applicationRepository.findById("app-1")).thenReturn(Optional.of(app));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        com.jobportal.application.dto.UpdateStageRequest req = new com.jobportal.application.dto.UpdateStageRequest();
        req.setStage(2);
        req.setNotes("Great candidate");
        ApplicationResponse result = applicationService.updateStage("app-1", req);

        assertEquals(ApplicationStatus.INTERVIEW, result.getStatus());
        assertEquals(2, result.getPipelineStage());
        assertEquals("Great candidate", result.getNotes());
    }
}
