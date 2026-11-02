package com.smartspend.controller;

import com.smartspend.dto.AccountRequest;
import com.smartspend.dto.AccountResponse;
import com.smartspend.entity.User;
import com.smartspend.service.AccountService;
import com.smartspend.service.AuthService;
import com.smartspend.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Endpoints for managing bank and financial accounts")
public class AccountController {

    private final AccountService accountService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get user accounts", description = "Fetches all active accounts associated with the authenticated user")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts() {
        User user = authService.getCurrentAuthenticatedUser();
        List<AccountResponse> accounts = accountService.getAccountsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @PostMapping
    @Operation(summary = "Create a new account", description = "Adds a new bank account or wallet for the user")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(@Valid @RequestBody AccountRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        AccountResponse created = accountService.createAccount(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID", description = "Retrieves details of a specific account")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        AccountResponse account = accountService.getAccountById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(account));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update account", description = "Modifies name, type, balance, or theme of an account")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody AccountRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        AccountResponse updated = accountService.updateAccount(id, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Account updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate account", description = "Soft-deletes/deactivates an account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        accountService.deleteAccount(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully", null));
    }
}
