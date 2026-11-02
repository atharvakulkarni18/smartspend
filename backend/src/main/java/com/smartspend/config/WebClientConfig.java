package com.smartspend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Configuration for WebClient instances used to interact with external services.
 */
@Configuration
public class WebClientConfig {

    @Value("${ai-service.base-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    /**
     * General WebClient.Builder bean.
     *
     * @return a new WebClient.Builder instance
     */
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    /**
     * Dedicated WebClient bean configured for communication with the AI Service.
     *
     * @param builder WebClient builder
     * @return configured WebClient for AI service
     */
    @Bean(name = "aiServiceWebClient")
    public WebClient aiServiceWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(aiServiceBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
