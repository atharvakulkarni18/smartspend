package com.smartspend.repository;

import com.smartspend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccountId(Long accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId ORDER BY t.transactionDate DESC, t.createdAt DESC")
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId " +
           "AND t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.account.user.id = :userId " +
           "AND t.type = :type " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") Transaction.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId AND t.isAnomaly = true ORDER BY t.createdAt DESC")
    List<Transaction> findAnomaliesByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId " +
           "AND t.category = :category " +
           "AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findByUserIdAndCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.account.user.id = :userId " +
           "AND t.category = :category " +
           "AND t.type = 'EXPENSE' " +
           "AND MONTH(t.transactionDate) = :month " +
           "AND YEAR(t.transactionDate) = :year")
    BigDecimal sumByUserAndCategoryAndMonth(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("month") int month,
            @Param("year") int year);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId ORDER BY t.transactionDate DESC, t.createdAt DESC")
    List<Transaction> findTop10ByUserId(@Param("userId") Long userId, Pageable pageable);

    Optional<Transaction> findByIdAndAccountUserId(Long id, Long userId);
}
