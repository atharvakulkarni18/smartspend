package com.smartspend.dto;

import com.smartspend.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {
    @NotBlank(message = "Account name is required")
    private String name;

    @NotNull(message = "Account type is required")
    private Account.AccountType type;

    private BigDecimal balance;

    private String currency;

    private String colorCode;
}
