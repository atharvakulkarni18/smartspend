package com.smartspend.controller;

import com.smartspend.dto.DashboardResponse;
import com.smartspend.entity.User;
import com.smartspend.service.AuthService;
import com.smartspend.service.DashboardService;
import com.smartspend.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated intelligence, trends, stats and summary endpoint")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get overview dashboard stats", description = "Returns aggregated financial metrics, trends, category distributions, recent transactions and budget alerts")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        User user = authService.getCurrentAuthenticatedUser();
        DashboardResponse data = dashboardService.getDashboardData(user.getId());
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
