package com.smartspend.controller;

import com.smartspend.dto.TransactionRequest;
import com.smartspend.dto.TransactionResponse;
import com.smartspend.entity.User;
import com.smartspend.service.AuthService;
import com.smartspend.service.TransactionService;
import com.smartspend.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Endpoints for managing transactions, AI categorization, and CSV imports")
public class TransactionController {

    private final TransactionService transactionService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get paginated transactions", description = "Retrieves user transactions with pagination and date sorting")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = authService.getCurrentAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionDate").descending().and(Sort.by("createdAt").descending()));
        Page<TransactionResponse> txns = transactionService.getTransactions(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(txns));
    }

    @PostMapping
    @Operation(summary = "Create transaction", description = "Records a transaction, applies AI auto-categorization and anomaly detection")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        TransactionResponse response = transactionService.createTransaction(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction details", description = "Retrieves an individual transaction record")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        TransactionResponse response = transactionService.getTransactionById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction", description = "Updates an existing transaction and recalculates account balances")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        TransactionResponse response = transactionService.updateTransaction(id, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Transaction updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction", description = "Removes a transaction and reverses its balance impact")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        transactionService.deleteTransaction(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted successfully", null));
    }

    @PostMapping(value = "/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import CSV statement", description = "Parses bank CSV statement and imports transactions in bulk")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("accountId") Long accountId) {
        User user = authService.getCurrentAuthenticatedUser();
        List<TransactionResponse> imported = transactionService.importCsv(file, accountId, user);
        return ResponseEntity.ok(ApiResponse.success("Imported " + imported.size() + " transactions successfully", imported));
    }

    @GetMapping("/anomalies")
    @Operation(summary = "Get suspicious transactions", description = "Lists transactions flagged as anomalous by the AI engine")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAnomalies() {
        User user = authService.getCurrentAuthenticatedUser();
        List<TransactionResponse> anomalies = transactionService.getAnomalies(user.getId());
        return ResponseEntity.ok(ApiResponse.success(anomalies));
    }
}
