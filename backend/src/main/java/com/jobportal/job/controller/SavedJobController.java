package com.jobportal.job.controller;

import com.jobportal.job.dto.SavedJobResponse;
import com.jobportal.job.service.SavedJobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Saved job endpoints")
public class SavedJobController {

    private final SavedJobService savedJobService;

    @Operation(summary = "Get saved jobs")
    @GetMapping("/saved")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Page<SavedJobResponse>> getSavedJobs(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(savedJobService.getSavedJobs(auth.getName(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @Operation(summary = "Toggle save job")
    @PostMapping("/{id}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<?> toggleSaveJob(Authentication auth, @PathVariable String id) {
        SavedJobResponse result = savedJobService.toggleSavedJob(auth.getName(), id);
        if (result == null) {
            return ResponseEntity.ok(Map.of("message", "Job unsaved"));
        }
        return ResponseEntity.ok(result);
    }
}
