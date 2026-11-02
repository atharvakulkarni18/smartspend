package com.smartspend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Transaction entity representing a financial transaction.
 * Supports AI categorization and anomaly detection results.
 */
@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_transaction_date", columnList = "transaction_date"),
        @Index(name = "idx_transaction_category", columnList = "category")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column
    private String category; // User-specified or AI-assigned

    @Column(name = "ai_category")
    private String aiCategory; // AI auto-categorized value

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(name = "is_anomaly")
    @Builder.Default
    private Boolean isAnomaly = false;

    @Column(name = "anomaly_score")
    private Double anomalyScore;

    @Column(name = "anomaly_reason", length = 500)
    private String anomalyReason;

    @Column(length = 1000)
    private String notes;

    @Column(name = "reference_number")
    private String referenceNumber;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionType {
        INCOME, EXPENSE, TRANSFER
    }
}
