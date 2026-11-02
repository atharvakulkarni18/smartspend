package com.smartspend.service;

import com.smartspend.dto.AccountRequest;
import com.smartspend.dto.AccountResponse;
import com.smartspend.entity.Account;
import com.smartspend.entity.User;
import com.smartspend.exception.ResourceNotFoundException;
import com.smartspend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public AccountResponse createAccount(AccountRequest request, User user) {
        Account account = Account.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType())
                .balance(request.getBalance() != null ? request.getBalance() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null && !request.getCurrency().isBlank() ? request.getCurrency().toUpperCase() : "INR")
                .colorCode(request.getColorCode() != null ? request.getColorCode() : "#6366f1")
                .isActive(true)
                .build();

        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    public List<AccountResponse> getAccountsByUser(Long userId) {
        return accountRepository.findByUserIdAndIsActive(userId, true)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Account getAccountEntity(Long accountId, Long userId) {
        return accountRepository.findById(accountId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
    }

    public AccountResponse getAccountById(Long accountId, Long userId) {
        return mapToResponse(getAccountEntity(accountId, userId));
    }

    @Transactional
    public AccountResponse updateAccount(Long accountId, AccountRequest request, Long userId) {
        Account account = getAccountEntity(accountId, userId);

        if (request.getName() != null && !request.getName().isBlank()) {
            account.setName(request.getName().trim());
        }
        if (request.getType() != null) {
            account.setType(request.getType());
        }
        if (request.getBalance() != null) {
            account.setBalance(request.getBalance());
        }
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            account.setCurrency(request.getCurrency().toUpperCase());
        }
        if (request.getColorCode() != null && !request.getColorCode().isBlank()) {
            account.setColorCode(request.getColorCode());
        }

        Account updated = accountRepository.save(account);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteAccount(Long accountId, Long userId) {
        Account account = getAccountEntity(accountId, userId);
        account.setIsActive(false);
        accountRepository.save(account);
    }

    public AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .type(account.getType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .isActive(account.getIsActive())
                .colorCode(account.getColorCode())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
