package com.jobportal.candidate.service;

import com.jobportal.candidate.dto.CandidateProfileRequest;
import com.jobportal.candidate.dto.CandidateProfileResponse;
import com.jobportal.candidate.entity.CandidateProfile;
import com.jobportal.candidate.repository.CandidateProfileRepository;
import com.jobportal.common.exception.ResourceNotFoundException;
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
class CandidateServiceTest {

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CandidateService candidateService;

    private User testUser;
    private CandidateProfile testProfile;
    private CandidateProfileRequest updateRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("candidate@test.com")
                .role(Role.CANDIDATE)
                .build();

        testProfile = CandidateProfile.builder()
                .id("profile-1")
                .user(testUser)
                .fullName("Jane Doe")
                .headline("Software Engineer")
                .bio("Experienced developer")
                .location("San Francisco")
                .salaryExpectation(100000)
                .currency("USD")
                .skills(List.of("Java", "Spring", "React"))
                .remote(true)
                .jobTypes(List.of("FULLTIME", "CONTRACT"))
                .build();

        updateRequest = new CandidateProfileRequest();
        updateRequest.setFullName("Jane Updated");
        updateRequest.setHeadline("Senior Software Engineer");
        updateRequest.setBio("Updated bio");
        updateRequest.setLocation("Los Angeles");
        updateRequest.setSalaryExpectation(120000);
        updateRequest.setCurrency("USD");
        updateRequest.setSkills(List.of("Java", "Spring", "React", "TypeScript"));
        updateRequest.setRemote(false);
        updateRequest.setJobTypes(List.of("FULLTIME"));
    }

    @Test
    void getProfile_Success() {
        when(candidateProfileRepository.findByUserId("user-1")).thenReturn(Optional.of(testProfile));

        CandidateProfileResponse result = candidateService.getProfile("user-1");

        assertNotNull(result);
        assertEquals("Jane Doe", result.getFullName());
        assertEquals("Software Engineer", result.getHeadline());
    }

    @Test
    void getProfile_NotFound() {
        when(candidateProfileRepository.findByUserId("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> candidateService.getProfile("unknown"));
    }

    @Test
    void updateProfile_ExistingProfile() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(candidateProfileRepository.findByUserId("user-1")).thenReturn(Optional.of(testProfile));
        when(candidateProfileRepository.save(any(CandidateProfile.class))).thenReturn(testProfile);

        CandidateProfileResponse result = candidateService.updateProfile("user-1", updateRequest);

        assertNotNull(result);
        assertEquals("Jane Updated", result.getFullName());
        assertEquals("Senior Software Engineer", result.getHeadline());
        assertEquals("Los Angeles", result.getLocation());
        assertEquals(120000, result.getSalaryExpectation());
        assertFalse(result.isRemote());
        verify(candidateProfileRepository).save(any(CandidateProfile.class));
    }

    @Test
    void updateProfile_NewProfile() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(candidateProfileRepository.findByUserId("user-1")).thenReturn(Optional.empty());
        when(candidateProfileRepository.save(any(CandidateProfile.class))).thenAnswer(i -> i.getArgument(0));

        CandidateProfileResponse result = candidateService.updateProfile("user-1", updateRequest);

        assertNotNull(result);
        assertEquals("Jane Updated", result.getFullName());
        assertEquals("user-1", result.getUserId());
        verify(candidateProfileRepository).save(any(CandidateProfile.class));
    }

    @Test
    void updateProfile_UserNotFound() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> candidateService.updateProfile("unknown", updateRequest));
        verify(candidateProfileRepository, never()).save(any());
    }

    @Test
    void searchBySkills_WithLocation() {
        Page<CandidateProfile> page = new PageImpl<>(List.of(testProfile));
        when(candidateProfileRepository.findBySkillsContainingAndLocationIgnoreCase(
                any(), any(), any())).thenReturn(page);

        Page<CandidateProfileResponse> result = candidateService.searchBySkills(
                List.of("Java"), "San Francisco", PageRequest.of(0, 20));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void searchBySkills_WithoutLocation() {
        Page<CandidateProfile> page = new PageImpl<>(List.of(testProfile));
        when(candidateProfileRepository.findBySkillsContaining(any(), any())).thenReturn(page);

        Page<CandidateProfileResponse> result = candidateService.searchBySkills(
                List.of("Java"), null, PageRequest.of(0, 20));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }
}
