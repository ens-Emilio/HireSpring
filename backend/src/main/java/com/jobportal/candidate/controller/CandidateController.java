package com.jobportal.candidate.controller;

import com.jobportal.candidate.dto.CandidateProfileRequest;
import com.jobportal.candidate.dto.CandidateProfileResponse;
import com.jobportal.candidate.service.CandidateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
@Tag(name = "Candidates", description = "Candidate profile and search endpoints")
public class CandidateController {

    private final CandidateService candidateService;

    @Operation(summary = "Get my profile")
    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileResponse> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(candidateService.getProfile(getUserId(auth)));
    }

    @Operation(summary = "Update my profile")
    @PutMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<CandidateProfileResponse> updateMyProfile(Authentication auth, @Valid @RequestBody CandidateProfileRequest request) {
        return ResponseEntity.ok(candidateService.updateProfile(getUserId(auth), request));
    }

    @Operation(summary = "Search candidates by skills and location")
    @GetMapping("/search")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Page<CandidateProfileResponse>> searchBySkills(
            @RequestParam java.util.List<String> skills,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(candidateService.searchBySkills(skills, location, PageRequest.of(page, size)));
    }

    private String getUserId(Authentication auth) {
        return auth.getName();
    }
}
