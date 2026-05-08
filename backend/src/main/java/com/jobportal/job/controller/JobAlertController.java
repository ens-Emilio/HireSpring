package com.jobportal.job.controller;

import com.jobportal.job.dto.JobAlertRequest;
import com.jobportal.job.dto.JobAlertResponse;
import com.jobportal.job.service.JobAlertService;
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
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Job Alerts", description = "Job alert configuration endpoints")
public class JobAlertController {

    private final JobAlertService jobAlertService;

    @Operation(summary = "Get user's job alerts")
    @GetMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Page<JobAlertResponse>> getMyAlerts(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(jobAlertService.getUserAlerts(auth.getName(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "Create a new job alert")
    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<JobAlertResponse> createAlert(Authentication auth, @Valid @RequestBody JobAlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobAlertService.createAlert(auth.getName(), request));
    }

    @Operation(summary = "Delete a job alert")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Void> deleteAlert(Authentication auth, @PathVariable String id) {
        jobAlertService.deleteAlert(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
