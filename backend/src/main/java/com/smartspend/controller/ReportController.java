package com.smartspend.controller;

import com.smartspend.entity.User;
import com.smartspend.service.AuthService;
import com.smartspend.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Endpoints for generating and downloading PDF reports")
public class ReportController {

    private final ReportService reportService;
    private final AuthService authService;

    @GetMapping("/monthly")
    @Operation(summary = "Download monthly financial report", description = "Generates and returns a formatted PDF document containing financial summaries and transaction details")
    public ResponseEntity<byte[]> downloadMonthlyReport(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        User user = authService.getCurrentAuthenticatedUser();
        int targetMonth = month != null ? month : LocalDate.now().getMonthValue();
        int targetYear = year != null ? year : LocalDate.now().getYear();

        byte[] pdfBytes = reportService.generateMonthlyReport(user, targetMonth, targetYear);

        String filename = String.format("smartspend-report-%d-%02d.pdf", targetYear, targetMonth);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
