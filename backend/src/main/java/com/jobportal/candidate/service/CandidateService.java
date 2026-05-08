package com.jobportal.candidate.service;

import com.jobportal.candidate.dto.CandidateProfileRequest;
import com.jobportal.candidate.dto.CandidateProfileResponse;
import com.jobportal.candidate.entity.CandidateProfile;
import com.jobportal.candidate.repository.CandidateProfileRepository;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.common.mapper.DtoMapper;
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
public class CandidateService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;

    public CandidateProfileResponse getProfile(String userId) {
        return DtoMapper.toCandidateProfileResponse(candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found")));
    }

    @Transactional
    public CandidateProfileResponse updateProfile(String userId, CandidateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElse(CandidateProfile.builder().user(user).build());

        profile.setFullName(request.getFullName());
        profile.setHeadline(request.getHeadline());
        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());
        profile.setSalaryExpectation(request.getSalaryExpectation());
        profile.setCurrency(request.getCurrency());
        profile.setSkills(request.getSkills());
        profile.setExperience(request.getExperience());
        profile.setEducation(request.getEducation());
        profile.setRemote(request.isRemote());
        profile.setJobTypes(request.getJobTypes());

        if (request.getResumeUrl() != null) {
            profile.setResumeUrl(request.getResumeUrl());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }

        log.info("Profile updated for user {}", userId);
        return DtoMapper.toCandidateProfileResponse(candidateProfileRepository.save(profile));
    }

    public Page<CandidateProfileResponse> searchBySkills(java.util.List<String> skills, String location, Pageable pageable) {
        if (location != null && !location.isBlank()) {
            return candidateProfileRepository.findBySkillsContainingAndLocationIgnoreCase(skills, location, pageable)
                    .map(DtoMapper::toCandidateProfileResponse);
        }
        return candidateProfileRepository.findBySkillsContaining(skills, pageable)
                .map(DtoMapper::toCandidateProfileResponse);
    }
}
