package com.jobportal.admin.controller;

import com.jobportal.admin.dto.ModerateJobRequest;
import com.jobportal.admin.service.AdminService;
import com.jobportal.job.dto.JobResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and moderation endpoints")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Get platform statistics")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @Operation(summary = "Get all jobs for moderation")
    @GetMapping("/jobs")
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.getAllJobs(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "Moderate a job")
    @PutMapping("/jobs/{id}/moderate")
    public ResponseEntity<JobResponse> moderateJob(@PathVariable String id, @Valid @RequestBody ModerateJobRequest request) {
        return ResponseEntity.ok(adminService.moderateJob(id, request));
    }

    @Operation(summary = "Trigger seed data")
    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> resetSeed() {
        return ResponseEntity.ok(Map.of("message", "Seed reset triggered - check logs"));
    }
}
