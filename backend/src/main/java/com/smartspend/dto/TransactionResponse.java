package com.smartspend.dto;

import com.smartspend.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long accountId;
    private String accountName;
    private BigDecimal amount;
    private String category;
    private String aiCategory;
    private Double aiConfidence;
    private String description;
    private LocalDate transactionDate;
    private Transaction.TransactionType type;
    private Boolean isAnomaly;
    private Double anomalyScore;
    private String anomalyReason;
    private String notes;
    private String referenceNumber;
    private LocalDateTime createdAt;
}
