package com.smartspend.controller;

import com.smartspend.dto.BudgetRequest;
import com.smartspend.dto.BudgetResponse;
import com.smartspend.entity.User;
import com.smartspend.service.AuthService;
import com.smartspend.service.BudgetService;
import com.smartspend.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "Endpoints for managing category-wise spending limits and alerts")
public class BudgetController {

    private final BudgetService budgetService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get user budgets", description = "Fetches budgets for a given month and year with real-time spent calculation")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        User user = authService.getCurrentAuthenticatedUser();
        List<BudgetResponse> budgets = budgetService.getBudgets(user.getId(), month, year);
        return ResponseEntity.ok(ApiResponse.success(budgets));
    }

    @PostMapping
    @Operation(summary = "Create budget", description = "Configures a new budget limit for a category")
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(@Valid @RequestBody BudgetRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        BudgetResponse created = budgetService.createBudget(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update budget", description = "Adjusts the threshold or limit amount of an active budget")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        BudgetResponse updated = budgetService.updateBudget(id, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete budget", description = "Removes a budget entry")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        budgetService.deleteBudget(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget removed successfully", null));
    }
}
