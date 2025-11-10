package com.zosh.payload.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of tax calculation containing total tax and breakdown by category
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCalculationResult {
    
    @Builder.Default
    private Double totalTax = 0.0;
    
    @Builder.Default
    private Double taxableAmount = 0.0;
    
    @Builder.Default
    private List<TaxBreakdownItem> breakdown = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaxBreakdownItem {
        private Long taxCategoryId;
        private String taxCategoryName;
        private Double percentage;
        private Double taxableAmount;
        private Double taxAmount;
    }
}
