package com.smartspend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private Double savingsRate;
    private Long activeAccountsCount;
    private Long anomalyCount;
    private List<MonthlyTrend> monthlyTrends;
    private Map<String, BigDecimal> categoryExpenses;
    private List<TransactionResponse> recentTransactions;
    private List<BudgetResponse> budgetAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private int monthNumber;
        private int year;
        private BigDecimal income;
        private BigDecimal expense;
    }
}
