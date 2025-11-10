package com.zosh.payload.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTaxBreakdownDTO {
    private Long id;
    private Long orderId;
    private Long taxCategoryId;
    private String taxCategoryName;
    private Double taxableAmount;
    private Double taxAmount;
    private Double taxPercentage;
}
