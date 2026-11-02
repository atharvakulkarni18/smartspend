package com.smartspend.service;

import com.opencsv.CSVReader;
import com.smartspend.dto.TransactionRequest;
import com.smartspend.dto.TransactionResponse;
import com.smartspend.entity.Account;
import com.smartspend.entity.Notification;
import com.smartspend.entity.Transaction;
import com.smartspend.entity.User;
import com.smartspend.exception.BadRequestException;
import com.smartspend.exception.ResourceNotFoundException;
import com.smartspend.repository.AccountRepository;
import com.smartspend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AIService aiService;
    private final BudgetService budgetService;
    private final NotificationService notificationService;

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request, User user) {
        Account account = accountRepository.findById(request.getAccountId())
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Account", request.getAccountId()));

        // Call AI categorization if category is not provided or if we want AI validation
        AIService.CategorizationResult catResult = aiService.categorizeTransaction(
                request.getDescription(), request.getAmount(), user.getId());

        String finalCategory = (request.getCategory() != null && !request.getCategory().isBlank())
                ? request.getCategory().trim()
                : catResult.getCategory();

        // Anomaly Detection: check recent transactions
        List<Transaction> recent = transactionRepository.findTop10ByUserId(user.getId(), PageRequest.of(0, 10));
        List<Map<String, Object>> recentList = recent.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("amount", t.getAmount().doubleValue());
            map.put("category", t.getCategory());
            map.put("date", t.getTransactionDate().toString());
            return map;
        }).collect(Collectors.toList());

        AIService.AnomalyResult anomalyResult = aiService.detectAnomaly(
                user.getId(), request.getAmount(), finalCategory, recentList);

        // Update Account Balance
        if (request.getType() == Transaction.TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().subtract(request.getAmount()));
        } else if (request.getType() == Transaction.TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(request.getAmount()));
        }
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .account(account)
                .amount(request.getAmount())
                .category(finalCategory)
                .aiCategory(catResult.getCategory())
                .aiConfidence(catResult.getConfidence())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now())
                .type(request.getType())
                .isAnomaly(anomalyResult.getIsAnomaly())
                .anomalyScore(anomalyResult.getAnomalyScore())
                .anomalyReason(anomalyResult.getReason())
                .notes(request.getNotes())
                .referenceNumber(request.getReferenceNumber())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Budget Alert Check
        if (request.getType() == Transaction.TransactionType.EXPENSE) {
            budgetService.checkAndTriggerBudgetAlert(user, finalCategory, saved.getTransactionDate());
        }

        // Anomaly Alert Notification
        if (Boolean.TRUE.equals(saved.getIsAnomaly())) {
            notificationService.sendAsyncNotification(
                    user,
                    "⚠️ Suspicious Transaction Detected",
                    String.format("Unusual transaction of ₹%.2f on '%s' flagged. Reason: %s",
                            saved.getAmount(), saved.getDescription(),
                            saved.getAnomalyReason() != null ? saved.getAnomalyReason() : "Deviates from typical spending profile"),
                    Notification.NotificationType.ANOMALY_DETECTED,
                    saved.getId()
            );
        }

        return mapToResponse(saved);
    }

    public Page<TransactionResponse> getTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    public List<TransactionResponse> getAnomalies(Long userId) {
        return transactionRepository.findAnomaliesByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long id, Long userId) {
        Transaction txn = transactionRepository.findByIdAndAccountUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        return mapToResponse(txn);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request, Long userId) {
        Transaction txn = transactionRepository.findByIdAndAccountUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));

        Account oldAccount = txn.getAccount();
        // Reverse previous balance effect
        if (txn.getType() == Transaction.TransactionType.EXPENSE) {
            oldAccount.setBalance(oldAccount.getBalance().add(txn.getAmount()));
        } else if (txn.getType() == Transaction.TransactionType.INCOME) {
            oldAccount.setBalance(oldAccount.getBalance().subtract(txn.getAmount()));
        }

        Account newAccount = oldAccount;
        if (request.getAccountId() != null && !request.getAccountId().equals(oldAccount.getId())) {
            accountRepository.save(oldAccount);
            newAccount = accountRepository.findById(request.getAccountId())
                    .filter(a -> a.getUser().getId().equals(userId))
                    .orElseThrow(() -> new ResourceNotFoundException("Account", request.getAccountId()));
        }

        // Apply new balance effect
        if (request.getType() == Transaction.TransactionType.EXPENSE) {
            newAccount.setBalance(newAccount.getBalance().subtract(request.getAmount()));
        } else if (request.getType() == Transaction.TransactionType.INCOME) {
            newAccount.setBalance(newAccount.getBalance().add(request.getAmount()));
        }
        accountRepository.save(newAccount);

        txn.setAccount(newAccount);
        txn.setAmount(request.getAmount());
        if (request.getCategory() != null) txn.setCategory(request.getCategory());
        txn.setDescription(request.getDescription());
        if (request.getTransactionDate() != null) txn.setTransactionDate(request.getTransactionDate());
        txn.setType(request.getType());
        txn.setNotes(request.getNotes());
        txn.setReferenceNumber(request.getReferenceNumber());

        Transaction updated = transactionRepository.save(txn);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTransaction(Long id, Long userId) {
        Transaction txn = transactionRepository.findByIdAndAccountUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));

        Account account = txn.getAccount();
        if (txn.getType() == Transaction.TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(txn.getAmount()));
        } else if (txn.getType() == Transaction.TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(txn.getAmount()));
        }
        accountRepository.save(account);

        transactionRepository.delete(txn);
    }

    @Transactional
    public List<TransactionResponse> importCsv(MultipartFile file, Long accountId, User user) {
        Account account = accountRepository.findById(accountId)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));

        List<TransactionResponse> imported = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            boolean isHeader = true;

            while ((line = reader.readNext()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip CSV header row
                }
                if (line.length < 3 || line[0].trim().isEmpty()) continue;

                // Expected format: Date, Description, Amount, Type (Optional), Category (Optional)
                String dateStr = line[0].trim();
                String desc = line[1].trim();
                BigDecimal amount = new BigDecimal(line[2].trim().replaceAll("[^0-9.]", ""));
                Transaction.TransactionType type = Transaction.TransactionType.EXPENSE;
                if (line.length >= 4 && !line[3].trim().isEmpty()) {
                    try {
                        type = Transaction.TransactionType.valueOf(line[3].trim().toUpperCase());
                    } catch (Exception ignored) {}
                }
                String category = (line.length >= 5 && !line[4].trim().isEmpty()) ? line[4].trim() : null;

                LocalDate txnDate;
                try {
                    txnDate = LocalDate.parse(dateStr, formatter);
                } catch (Exception e) {
                    txnDate = LocalDate.now();
                }

                TransactionRequest req = new TransactionRequest();
                req.setAccountId(accountId);
                req.setAmount(amount);
                req.setDescription(desc);
                req.setType(type);
                req.setCategory(category);
                req.setTransactionDate(txnDate);

                imported.add(createTransaction(req, user));
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse CSV statement: " + e.getMessage());
        }

        return imported;
    }

    public TransactionResponse mapToResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .accountId(txn.getAccount().getId())
                .accountName(txn.getAccount().getName())
                .amount(txn.getAmount())
                .category(txn.getCategory())
                .aiCategory(txn.getAiCategory())
                .aiConfidence(txn.getAiConfidence())
                .description(txn.getDescription())
                .transactionDate(txn.getTransactionDate())
                .type(txn.getType())
                .isAnomaly(txn.getIsAnomaly())
                .anomalyScore(txn.getAnomalyScore())
                .anomalyReason(txn.getAnomalyReason())
                .notes(txn.getNotes())
                .referenceNumber(txn.getReferenceNumber())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
