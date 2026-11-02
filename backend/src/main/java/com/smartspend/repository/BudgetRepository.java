package com.smartspend.repository;

import com.smartspend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndIsActive(Long userId, Boolean isActive);
    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(Long userId, String category, int month, int year);
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
}
