package com.smartspend.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;

@Service
@Slf4j
public class AIService {

    private final WebClient aiWebClient;

    public AIService(@Qualifier("aiServiceWebClient") WebClient aiWebClient) {
        this.aiWebClient = aiWebClient;
    }

    public CategorizationResult categorizeTransaction(String description, BigDecimal amount, Long userId) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("description", description != null ? description : "");
            body.put("amount", amount != null ? amount.doubleValue() : 0.0);
            body.put("userId", userId);

            CategorizationResult result = aiWebClient.post()
                    .uri("/categorize")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(CategorizationResult.class)
                    .block();

            if (result != null && result.getCategory() != null) {
                return result;
            }
        } catch (Exception e) {
            log.warn("AI categorization service unavailable or failed: {}. Falling back to rule-based fallback.", e.getMessage());
        }

        // Fallback default categorization if AI service is temporarily offline
        String fallbackCategory = fallbackCategorize(description);
        return new CategorizationResult(fallbackCategory, 0.5, Collections.emptyList());
    }

    public AnomalyResult detectAnomaly(Long userId, BigDecimal amount, String category, List<Map<String, Object>> recentTxns) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("amount", amount != null ? amount.doubleValue() : 0.0);
            body.put("category", category != null ? category : "Miscellaneous");
            body.put("recentTransactions", recentTxns != null ? recentTxns : Collections.emptyList());

            AnomalyResult result = aiWebClient.post()
                    .uri("/detect-anomaly")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(AnomalyResult.class)
                    .block();

            if (result != null) {
                return result;
            }
        } catch (Exception e) {
            log.warn("AI anomaly detection failed: {}. Using default rule-based check.", e.getMessage());
        }

        boolean isAnomaly = amount != null && amount.compareTo(new BigDecimal("50000")) > 0;
        return new AnomalyResult(isAnomaly, isAnomaly ? 0.85 : 0.05, isAnomaly ? "High transaction value threshold exceeded" : null);
    }

    public PredictionResult predictSpending(Long userId, List<Map<String, Object>> historicalData) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("historicalData", historicalData != null ? historicalData : Collections.emptyList());

            PredictionResult result = aiWebClient.post()
                    .uri("/predict-spending")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(PredictionResult.class)
                    .block();

            if (result != null) {
                return result;
            }
        } catch (Exception e) {
            log.warn("AI prediction service failed: {}. Providing baseline projection.", e.getMessage());
        }

        return new PredictionResult(new HashMap<>(), 0.0, "Low", "AI Service unavailable, unable to generate predictive projections");
    }

    private String fallbackCategorize(String description) {
        if (description == null) return "Miscellaneous";
        String lower = description.toLowerCase();
        if (lower.contains("swiggy") || lower.contains("zomato") || lower.contains("food") || lower.contains("restaurant") || lower.contains("cafe")) {
            return "Food & Dining";
        } else if (lower.contains("uber") || lower.contains("ola") || lower.contains("metro") || lower.contains("petrol") || lower.contains("flight")) {
            return "Transportation";
        } else if (lower.contains("amazon") || lower.contains("flipkart") || lower.contains("myntra") || lower.contains("shop")) {
            return "Shopping";
        } else if (lower.contains("rent") || lower.contains("flat") || lower.contains("pg")) {
            return "Rent & Housing";
        } else if (lower.contains("recharge") || lower.contains("jio") || lower.contains("airtel") || lower.contains("electricity")) {
            return "Utilities";
        } else if (lower.contains("hospital") || lower.contains("medicine") || lower.contains("pharmacy") || lower.contains("doctor")) {
            return "Healthcare";
        } else if (lower.contains("netflix") || lower.contains("spotify") || lower.contains("movie") || lower.contains("hotstar")) {
            return "Entertainment";
        } else if (lower.contains("grocery") || lower.contains("blinkit") || lower.contains("zepto") || lower.contains("bigbasket")) {
            return "Groceries";
        } else if (lower.contains("salary") || lower.contains("dividend") || lower.contains("interest")) {
            return "Income";
        }
        return "Miscellaneous";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorizationResult {
        private String category;
        private Double confidence;
        private List<String> alternativeCategories;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyResult {
        private Boolean isAnomaly;
        private Double anomalyScore;
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionResult {
        private Map<String, Double> predictions;
        private Double totalPredicted;
        private String confidence;
        private String message;
    }
}
