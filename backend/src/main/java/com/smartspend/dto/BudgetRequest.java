package com.smartspend.dto;

import com.smartspend.entity.Budget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Limit amount is required")
    @Positive(message = "Limit amount must be greater than zero")
    private BigDecimal limitAmount;

    private Budget.BudgetPeriod period = Budget.BudgetPeriod.MONTHLY;

    private Integer alertThreshold = 80;

    @NotNull(message = "Month is required")
    private Integer month;

    @NotNull(message = "Year is required")
    private Integer year;
}
