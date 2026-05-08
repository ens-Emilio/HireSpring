package com.jobportal.notification.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private String id;
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
