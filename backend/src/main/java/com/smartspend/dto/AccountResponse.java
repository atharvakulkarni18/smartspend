package com.smartspend.dto;

import com.smartspend.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String name;
    private Account.AccountType type;
    private BigDecimal balance;
    private String currency;
    private Boolean isActive;
    private String colorCode;
    private LocalDateTime createdAt;
}
