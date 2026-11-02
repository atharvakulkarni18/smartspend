package com.smartspend.service;

import com.smartspend.dto.BudgetResponse;
import com.smartspend.dto.DashboardResponse;
import com.smartspend.dto.TransactionResponse;
import com.smartspend.entity.Account;
import com.smartspend.entity.Transaction;
import com.smartspend.repository.AccountRepository;
import com.smartspend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final BudgetService budgetService;

    public DashboardResponse getDashboardData(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        // Accounts balance
        List<Account> accounts = accountRepository.findByUserIdAndIsActive(userId, true);
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Income & Expense for current month
        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                userId, Transaction.TransactionType.INCOME, startOfMonth, endOfMonth);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE, startOfMonth, endOfMonth);
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.subtract(totalExpense);
        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        // Monthly trends for past 6 months
        List<DashboardResponse.MonthlyTrend> monthlyTrends = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate target = now.minusMonths(i);
            LocalDate start = target.withDayOfMonth(1);
            LocalDate end = target.withDayOfMonth(target.lengthOfMonth());

            BigDecimal inc = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                    userId, Transaction.TransactionType.INCOME, start, end);
            BigDecimal exp = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                    userId, Transaction.TransactionType.EXPENSE, start, end);

            String monthName = target.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            monthlyTrends.add(DashboardResponse.MonthlyTrend.builder()
                    .month(monthName + " " + target.getYear())
                    .monthNumber(target.getMonthValue())
                    .year(target.getYear())
                    .income(inc != null ? inc : BigDecimal.ZERO)
                    .expense(exp != null ? exp : BigDecimal.ZERO)
                    .build());
        }

        // Category breakdown for current month
        List<Transaction> monthExpenses = transactionRepository.findByUserIdAndTypeAndDateRange(
                userId, Transaction.TransactionType.EXPENSE, startOfMonth, endOfMonth);

        Map<String, BigDecimal> categoryExpenses = new HashMap<>();
        for (Transaction txn : monthExpenses) {
            String cat = txn.getCategory() != null ? txn.getCategory() : "Miscellaneous";
            categoryExpenses.put(cat, categoryExpenses.getOrDefault(cat, BigDecimal.ZERO).add(txn.getAmount()));
        }

        // Recent transactions (10)
        List<TransactionResponse> recentTxns = transactionRepository.findTop10ByUserId(userId, PageRequest.of(0, 10))
                .stream()
                .map(transactionService::mapToResponse)
                .collect(Collectors.toList());

        // Anomalies count
        long anomalyCount = transactionRepository.findAnomaliesByUserId(userId).size();

        // Budget Alerts
        List<BudgetResponse> budgets = budgetService.getBudgets(userId, now.getMonthValue(), now.getYear());
        List<BudgetResponse> budgetAlerts = budgets.stream()
                .filter(b -> Boolean.TRUE.equals(b.getIsAlertTriggered()) || Boolean.TRUE.equals(b.getIsOverBudget()))
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalBalance(totalBalance)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .savingsRate(Math.round(savingsRate * 100.0) / 100.0)
                .activeAccountsCount((long) accounts.size())
                .anomalyCount(anomalyCount)
                .monthlyTrends(monthlyTrends)
                .categoryExpenses(categoryExpenses)
                .recentTransactions(recentTxns)
                .budgetAlerts(budgetAlerts)
                .build();
    }
}
