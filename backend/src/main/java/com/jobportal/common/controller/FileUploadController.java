package com.jobportal.common.controller;

import com.jobportal.common.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "File upload endpoints")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @Operation(summary = "Upload resume")
    @PostMapping("/resume")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Map<String, String>> uploadResume(Authentication auth, @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file, "resumes");
        return ResponseEntity.ok(Map.of("url", url, "filename", file.getOriginalFilename()));
    }

    @Operation(summary = "Upload avatar")
    @PostMapping("/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(Authentication auth, @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file, "avatars");
        return ResponseEntity.ok(Map.of("url", url, "filename", file.getOriginalFilename()));
    }

    @Operation(summary = "Upload company logo")
    @PostMapping("/logo")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, String>> uploadLogo(Authentication auth, @RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file, "logos");
        return ResponseEntity.ok(Map.of("url", url, "filename", file.getOriginalFilename()));
    }
}
