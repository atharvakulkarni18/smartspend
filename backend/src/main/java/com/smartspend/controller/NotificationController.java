package com.smartspend.controller;

import com.smartspend.entity.Notification;
import com.smartspend.entity.User;
import com.smartspend.service.AuthService;
import com.smartspend.service.NotificationService;
import com.smartspend.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for managing user alerts and in-app notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Fetches recent alerts and notifications for current user")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(defaultValue = "30") int limit) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Notification> notifications = notificationService.getUserNotifications(user.getId(), limit);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Returns number of unread alerts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User user = authService.getCurrentAuthenticatedUser();
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Marks all user alerts as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}
