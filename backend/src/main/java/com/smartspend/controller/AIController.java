package com.smartspend.controller;

import com.smartspend.dto.TransactionResponse;
import com.smartspend.entity.Transaction;
import com.smartspend.entity.User;
import com.smartspend.repository.TransactionRepository;
import com.smartspend.service.AIService;
import com.smartspend.service.AuthService;
import com.smartspend.service.TransactionService;
import com.smartspend.util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Intelligence", description = "Endpoints interacting with Python AI ML microservices")
public class AIController {

    private final AIService aiService;
    private final AuthService authService;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    @PostMapping("/categorize")
    @Operation(summary = "Categorize transaction description", description = "Passes description to AI model and returns predicted category & confidence score")
    public ResponseEntity<ApiResponse<AIService.CategorizationResult>> categorize(
            @RequestBody Map<String, Object> request) {
        User user = authService.getCurrentAuthenticatedUser();
        String description = (String) request.get("description");
        BigDecimal amount = request.containsKey("amount") ? new BigDecimal(request.get("amount").toString()) : BigDecimal.ZERO;

        AIService.CategorizationResult result = aiService.categorizeTransaction(description, amount, user.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/predict-spending")
    @Operation(summary = "Predict future spending", description = "Utilizes historical spending data and linear regression models to forecast next month's category-wise expenses")
    public ResponseEntity<ApiResponse<AIService.PredictionResult>> predictSpending() {
        User user = authService.getCurrentAuthenticatedUser();

        // Gather 6 months historical data
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6).withDayOfMonth(1);
        List<Transaction> pastTxns = transactionRepository.findByUserIdAndTypeAndDateRange(
                user.getId(), Transaction.TransactionType.EXPENSE, sixMonthsAgo, LocalDate.now());

        List<Map<String, Object>> historical = pastTxns.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", t.getCategory());
            map.put("amount", t.getAmount().doubleValue());
            map.put("month", t.getTransactionDate().getMonthValue());
            map.put("year", t.getTransactionDate().getYear());
            return map;
        }).collect(Collectors.toList());

        AIService.PredictionResult predictions = aiService.predictSpending(user.getId(), historical);
        return ResponseEntity.ok(ApiResponse.success(predictions));
    }

    @GetMapping("/anomalies")
    @Operation(summary = "Get detected anomalies", description = "Returns transactions flagged as outliers by the AI engine")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAnomalies() {
        User user = authService.getCurrentAuthenticatedUser();
        List<TransactionResponse> anomalies = transactionService.getAnomalies(user.getId());
        return ResponseEntity.ok(ApiResponse.success(anomalies));
    }
}
