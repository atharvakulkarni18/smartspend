package com.smartspend.dto;

import com.smartspend.entity.Budget;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private String category;
    private BigDecimal limitAmount;
    private Budget.BudgetPeriod period;
    private Integer alertThreshold;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double percentageUsed;
    private Boolean isOverBudget;
    private Boolean isAlertTriggered;
    private Integer month;
    private Integer year;
}
