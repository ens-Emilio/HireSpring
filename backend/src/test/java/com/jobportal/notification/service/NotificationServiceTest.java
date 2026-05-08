package com.jobportal.notification.service;

import com.jobportal.common.exception.ForbiddenException;
import com.jobportal.common.exception.ResourceNotFoundException;
import com.jobportal.notification.dto.NotificationResponse;
import com.jobportal.notification.entity.Notification;
import com.jobportal.notification.repository.NotificationRepository;
import com.jobportal.user.entity.Role;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-1")
                .email("user@test.com")
                .role(Role.CANDIDATE)
                .build();

        testNotification = Notification.builder()
                .id("notif-1")
                .user(testUser)
                .title("Application Update")
                .message("Your application has been reviewed")
                .read(false)
                .build();
    }

    @Test
    void getUnreadNotifications_ReturnsPage() {
        Page<Notification> page = new PageImpl<>(List.of(testNotification));
        when(notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(
                eq("user-1"), any(PageRequest.class))).thenReturn(page);

        Page<NotificationResponse> result = notificationService.getUnreadNotifications("user-1", PageRequest.of(0, 20));

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertFalse(result.getContent().get(0).isRead());
    }

    @Test
    void getUnreadCount_ReturnsCount() {
        when(notificationRepository.countByUserIdAndReadFalse("user-1")).thenReturn(5L);

        long count = notificationService.getUnreadCount("user-1");

        assertEquals(5L, count);
    }

    @Test
    void markAsRead_Success() {
        when(notificationRepository.findById("notif-1")).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.markAsRead("notif-1", "user-1");

        assertTrue(testNotification.isRead());
        verify(notificationRepository).save(testNotification);
    }

    @Test
    void markAsRead_NotificationNotFound() {
        when(notificationRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead("unknown", "user-1"));
    }

    @Test
    void markAsRead_NotOwner() {
        User otherUser = User.builder().id("user-2").build();
        Notification otherNotification = Notification.builder()
                .id("notif-2")
                .user(otherUser)
                .build();

        when(notificationRepository.findById("notif-2")).thenReturn(Optional.of(otherNotification));

        assertThrows(ForbiddenException.class, () -> notificationService.markAsRead("notif-2", "user-1"));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createNotification_Success() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        notificationService.createNotification("user-1", "New Job", "A new job matches your alert");

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createNotification_UserNotFound() {
        when(userRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.createNotification("unknown", "Title", "Message"));
        verify(notificationRepository, never()).save(any());
    }
}
