package com.smartspend.service;

import com.smartspend.dto.BudgetRequest;
import com.smartspend.dto.BudgetResponse;
import com.smartspend.entity.Budget;
import com.smartspend.entity.Notification;
import com.smartspend.entity.User;
import com.smartspend.exception.BadRequestException;
import com.smartspend.exception.ResourceNotFoundException;
import com.smartspend.repository.BudgetRepository;
import com.smartspend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    @Transactional
    public BudgetResponse createBudget(BudgetRequest request, User user) {
        int month = request.getMonth() != null ? request.getMonth() : LocalDate.now().getMonthValue();
        int year = request.getYear() != null ? request.getYear() : LocalDate.now().getYear();

        Optional<Budget> existing = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                user.getId(), request.getCategory(), month, year);
        if (existing.isPresent()) {
            throw new BadRequestException("A budget for category '" + request.getCategory() + "' already exists for " + month + "/" + year);
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(request.getCategory().trim())
                .limitAmount(request.getLimitAmount())
                .period(request.getPeriod() != null ? request.getPeriod() : Budget.BudgetPeriod.MONTHLY)
                .alertThreshold(request.getAlertThreshold() != null ? request.getAlertThreshold() : 80)
                .month(month)
                .year(year)
                .isActive(true)
                .build();

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved);
    }

    public List<BudgetResponse> getBudgets(Long userId, Integer month, Integer year) {
        int targetMonth = month != null ? month : LocalDate.now().getMonthValue();
        int targetYear = year != null ? year : LocalDate.now().getYear();

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, targetMonth, targetYear);
        return budgets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse updateBudget(Long budgetId, BudgetRequest request, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));

        if (request.getLimitAmount() != null) {
            budget.setLimitAmount(request.getLimitAmount());
        }
        if (request.getAlertThreshold() != null) {
            budget.setAlertThreshold(request.getAlertThreshold());
        }
        if (request.getPeriod() != null) {
            budget.setPeriod(request.getPeriod());
        }

        Budget updated = budgetRepository.save(budget);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget", budgetId));
        budgetRepository.delete(budget);
    }

    public void checkAndTriggerBudgetAlert(User user, String category, LocalDate txnDate) {
        int month = txnDate.getMonthValue();
        int year = txnDate.getYear();

        Optional<Budget> optionalBudget = budgetRepository.findByUserIdAndCategoryAndMonthAndYear(
                user.getId(), category, month, year);

        if (optionalBudget.isPresent()) {
            Budget budget = optionalBudget.get();
            BigDecimal spent = transactionRepository.sumByUserAndCategoryAndMonth(user.getId(), category, month, year);
            if (spent == null) spent = BigDecimal.ZERO;

            if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percentage = spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"));

                if (percentage.doubleValue() >= budget.getAlertThreshold()) {
                    String title = "Budget Alert: " + category;
                    String message = String.format("You have used %.1f%% of your ₹%.2f budget for %s (Spent: ₹%.2f)",
                            percentage.doubleValue(), budget.getLimitAmount(), category, spent);

                    notificationService.sendAsyncNotification(
                            user,
                            title,
                            message,
                            Notification.NotificationType.BUDGET_ALERT,
                            budget.getId()
                    );
                }
            }
        }
    }

    public BudgetResponse mapToResponse(Budget budget) {
        BigDecimal spent = transactionRepository.sumByUserAndCategoryAndMonth(
                budget.getUser().getId(), budget.getCategory(), budget.getMonth(), budget.getYear());
        if (spent == null) spent = BigDecimal.ZERO;

        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        double percentUsed = 0.0;
        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentUsed = spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")).doubleValue();
        }

        boolean isOver = spent.compareTo(budget.getLimitAmount()) > 0;
        boolean isAlert = percentUsed >= budget.getAlertThreshold();

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .limitAmount(budget.getLimitAmount())
                .period(budget.getPeriod())
                .alertThreshold(budget.getAlertThreshold())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentageUsed(Math.round(percentUsed * 100.0) / 100.0)
                .isOverBudget(isOver)
                .isAlertTriggered(isAlert)
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}
