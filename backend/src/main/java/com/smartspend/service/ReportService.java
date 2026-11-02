package com.smartspend.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.smartspend.entity.Transaction;
import com.smartspend.entity.User;
import com.smartspend.exception.BadRequestException;
import com.smartspend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final TransactionRepository transactionRepository;

    public byte[] generateMonthlyReport(User user, int month, int year) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            LocalDate startDate = LocalDate.of(year, month, 1);
            LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
            String monthName = startDate.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

            List<Transaction> transactions = transactionRepository.findByUserIdAndDateRange(
                    user.getId(), startDate, endDate);

            BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                    user.getId(), Transaction.TransactionType.INCOME, startDate, endDate);
            if (totalIncome == null) totalIncome = BigDecimal.ZERO;

            BigDecimal totalExpense = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                    user.getId(), Transaction.TransactionType.EXPENSE, startDate, endDate);
            if (totalExpense == null) totalExpense = BigDecimal.ZERO;

            BigDecimal netSavings = totalIncome.subtract(totalExpense);

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Styling colors
            DeviceRgb primaryColor = new DeviceRgb(99, 102, 241); // #6366f1
            DeviceRgb headerBg = new DeviceRgb(243, 244, 246);

            // Title Header
            Paragraph title = new Paragraph("SmartSpend — Financial Statement")
                    .setFontSize(22)
                    .setBold()
                    .setFontColor(primaryColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            Paragraph period = new Paragraph("Statement Period: " + monthName + " " + year + " | Prepared for: " + user.getName() + " (" + user.getEmail() + ")")
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(period);

            // Summary Section
            Paragraph summaryTitle = new Paragraph("Monthly Summary").setFontSize(14).setBold().setMarginBottom(8);
            document.add(summaryTitle);

            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{33.3f, 33.3f, 33.3f}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            summaryTable.addHeaderCell(new Cell().add(new Paragraph("Total Income")).setBackgroundColor(headerBg).setBold());
            summaryTable.addHeaderCell(new Cell().add(new Paragraph("Total Expenses")).setBackgroundColor(headerBg).setBold());
            summaryTable.addHeaderCell(new Cell().add(new Paragraph("Net Savings")).setBackgroundColor(headerBg).setBold());

            summaryTable.addCell(new Cell().add(new Paragraph("₹ " + totalIncome.toPlainString())).setFontColor(new DeviceRgb(16, 185, 129)));
            summaryTable.addCell(new Cell().add(new Paragraph("₹ " + totalExpense.toPlainString())).setFontColor(new DeviceRgb(239, 68, 68)));
            summaryTable.addCell(new Cell().add(new Paragraph("₹ " + netSavings.toPlainString())).setFontColor(primaryColor).setBold());
            document.add(summaryTable);

            // Transactions Table
            Paragraph txnsTitle = new Paragraph("Transactions History (" + transactions.size() + ")").setFontSize(14).setBold().setMarginBottom(8);
            document.add(txnsTitle);

            Table table = new Table(UnitValue.createPercentArray(new float[]{18f, 34f, 20f, 13f, 15f}))
                    .useAllAvailableWidth();

            table.addHeaderCell(new Cell().add(new Paragraph("Date")).setBackgroundColor(headerBg).setBold());
            table.addHeaderCell(new Cell().add(new Paragraph("Description")).setBackgroundColor(headerBg).setBold());
            table.addHeaderCell(new Cell().add(new Paragraph("Category")).setBackgroundColor(headerBg).setBold());
            table.addHeaderCell(new Cell().add(new Paragraph("Type")).setBackgroundColor(headerBg).setBold());
            table.addHeaderCell(new Cell().add(new Paragraph("Amount")).setBackgroundColor(headerBg).setBold());

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy");
            for (Transaction txn : transactions) {
                table.addCell(new Cell().add(new Paragraph(txn.getTransactionDate().format(dtf)).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(txn.getDescription() != null ? txn.getDescription() : "-").setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(txn.getCategory() != null ? txn.getCategory() : "General").setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(txn.getType().name()).setFontSize(9)));

                Paragraph amtPara = new Paragraph("₹ " + txn.getAmount().toPlainString()).setFontSize(9).setBold();
                if (txn.getType() == Transaction.TransactionType.INCOME) {
                    amtPara.setFontColor(new DeviceRgb(16, 185, 129));
                } else {
                    amtPara.setFontColor(new DeviceRgb(239, 68, 68));
                }
                table.addCell(new Cell().add(amtPara));
            }
            document.add(table);

            // Footer note
            Paragraph footer = new Paragraph("\nGenerated automatically by SmartSpend AI Financial Intelligence Platform on " + LocalDate.now().toString())
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to generate financial PDF report: " + e.getMessage());
        }
    }
}
