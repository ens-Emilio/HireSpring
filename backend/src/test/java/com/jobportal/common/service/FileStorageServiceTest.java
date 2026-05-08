package com.jobportal.common.service;

import com.jobportal.common.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileStorageServiceTest {

    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempDir.toString());
    }

    @Test
    void storeFile_ValidPdf_Success() {
        MultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", "PDF content".getBytes());

        String result = fileStorageService.storeFile(file, "resumes");

        assertNotNull(result);
        assertTrue(result.startsWith("/uploads/resumes/"));
        assertTrue(result.endsWith(".pdf"));
    }

    @Test
    void storeFile_ValidImage_Success() {
        MultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", "image content".getBytes());

        String result = fileStorageService.storeFile(file, "avatars");

        assertNotNull(result);
        assertTrue(result.startsWith("/uploads/avatars/"));
        assertTrue(result.endsWith(".jpg"));
    }

    @Test
    void storeFile_EmptyFile_ThrowsException() {
        MultipartFile file = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        assertThrows(BusinessException.class, () -> fileStorageService.storeFile(file, "resumes"));
    }

    @Test
    void storeFile_InvalidExtension_ThrowsException() {
        MultipartFile file = new MockMultipartFile(
                "file", "malicious.exe", "application/octet-stream", "bad content".getBytes());

        assertThrows(BusinessException.class, () -> fileStorageService.storeFile(file, "resumes"));
    }

    @Test
    void storeFile_NoExtension_ThrowsException() {
        MultipartFile file = new MockMultipartFile(
                "file", "nofileextension", "application/pdf", "content".getBytes());

        assertThrows(BusinessException.class, () -> fileStorageService.storeFile(file, "resumes"));
    }

    @Test
    void storeFile_InvalidContentType_ThrowsException() {
        MultipartFile file = new MockMultipartFile(
                "file", "file.txt", "text/plain", "text content".getBytes());

        assertThrows(BusinessException.class, () -> fileStorageService.storeFile(file, "resumes"));
    }

    @Test
    void deleteFile_Success() {
        MultipartFile file = new MockMultipartFile(
                "file", "delete-me.pdf", "application/pdf", "content".getBytes());
        String storedPath = fileStorageService.storeFile(file, "resumes");

        assertDoesNotThrow(() -> fileStorageService.deleteFile(storedPath));
    }

    @Test
    void deleteFile_NullPath_DoesNotThrow() {
        assertDoesNotThrow(() -> fileStorageService.deleteFile(null));
    }

    @Test
    void deleteFile_PathTraversal_ThrowsException() {
        assertThrows(BusinessException.class, () ->
                fileStorageService.deleteFile("/uploads/../../../etc/passwd"));
    }
}
