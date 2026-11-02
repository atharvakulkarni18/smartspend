package com.smartspend.service;

import com.smartspend.entity.Notification;
import com.smartspend.entity.User;
import com.smartspend.exception.ResourceNotFoundException;
import com.smartspend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User user, String title, String message,
                                          Notification.NotificationType type, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .relatedEntityId(relatedEntityId)
                .build();
        return notificationRepository.save(notification);
    }

    @Async
    public void sendAsyncNotification(User user, String title, String message,
                                     Notification.NotificationType type, Long relatedEntityId) {
        try {
            createNotification(user, title, message, type, relatedEntityId);
            log.info("Notification sent to user {}: {}", user.getEmail(), title);
        } catch (Exception e) {
            log.error("Failed to send async notification to user {}: {}", user.getId(), e.getMessage());
        }
    }

    public List<Notification> getUserNotifications(Long userId, int limit) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit));
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public void markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .filter(n -> n.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
