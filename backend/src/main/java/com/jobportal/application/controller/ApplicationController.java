package com.jobportal.application.controller;

import com.jobportal.application.dto.ApplicationResponse;
import com.jobportal.application.dto.UpdateStageRequest;
import com.jobportal.application.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Job application management endpoints")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Operation(summary = "Apply to a job")
    @PostMapping("/jobs/{jobId}/apply")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationResponse> applyToJob(Authentication auth, @PathVariable String jobId, @RequestBody(required = false) String coverLetter) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyToJob(auth.getName(), jobId, coverLetter));
    }

    @Operation(summary = "Get my applications")
    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(applicationService.getMyApplications(auth.getName(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"))));
    }

    @Operation(summary = "Get applications for a job")
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Page<ApplicationResponse>> getJobApplications(
            @PathVariable String jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(applicationService.getJobApplications(jobId, PageRequest.of(page, size)));
    }

    @Operation(summary = "Update application stage")
    @PutMapping("/{id}/stage")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<ApplicationResponse> updateStage(@PathVariable String id, @Valid @RequestBody UpdateStageRequest request) {
        return ResponseEntity.ok(applicationService.updateStage(id, request));
    }
}
