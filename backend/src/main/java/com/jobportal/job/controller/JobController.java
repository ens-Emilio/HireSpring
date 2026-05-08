package com.jobportal.job.controller;

import com.jobportal.job.dto.JobCreateRequest;
import com.jobportal.job.dto.JobResponse;
import com.jobportal.job.dto.JobUpdateRequest;
import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobType;
import com.jobportal.job.service.JobService;
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
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "Job listing and management endpoints")
public class JobController {

    private final JobService jobService;

    @Operation(summary = "Get all active jobs")
    @GetMapping
    public ResponseEntity<Page<JobResponse>> getJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean remote,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) JobLevel level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(jobService.searchJobs(search, remote, jobType, level, pageRequest));
        }
        return ResponseEntity.ok(jobService.getAllJobs(pageRequest));
    }

    @Operation(summary = "Get job by ID")
    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @Operation(summary = "Create a new job")
    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> createJob(Authentication auth, @Valid @RequestBody JobCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(auth.getName(), request));
    }

    @Operation(summary = "Update a job")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> updateJob(Authentication auth, @PathVariable String id, @Valid @RequestBody JobUpdateRequest request) {
        return ResponseEntity.ok(jobService.updateJob(id, auth.getName(), request));
    }

    @Operation(summary = "Delete a job")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(Authentication auth, @PathVariable String id) {
        jobService.deleteJob(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
