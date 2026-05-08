package com.jobportal.common.service;

import com.jobportal.common.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final Path uploadDir;

    public FileStorageService(@Value("${app.file.upload-dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        createDirectories();
    }

    private void createDirectories() {
        try {
            Files.createDirectories(uploadDir.resolve("resumes"));
            Files.createDirectories(uploadDir.resolve("avatars"));
            Files.createDirectories(uploadDir.resolve("logos"));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories", e);
        }
    }

    public String storeFile(MultipartFile file, String subdirectory) {
        validateFile(file);
        String originalFileName = file.getOriginalFilename();
        String extension = getExtension(originalFileName);
        String fileName = UUID.randomUUID().toString() + extension;

        Path targetLocation = uploadDir.resolve(subdirectory).resolve(fileName);
        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + subdirectory + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new BusinessException("File must have an extension");
        }
        String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BusinessException("File type not allowed. Allowed: " + ALLOWED_EXTENSIONS);
        }
        return ext;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Cannot upload empty file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("File size exceeds maximum allowed size (10MB)");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            throw new BusinessException("Only images and PDF files are allowed");
        }
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null) return;
        try {
            Path filePath = uploadDir.resolve(fileUrl.replace("/uploads/", "")).normalize();
            if (!filePath.startsWith(uploadDir)) {
                throw new BusinessException("Invalid file path");
            }
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log but don't fail if file doesn't exist
        }
    }
}
