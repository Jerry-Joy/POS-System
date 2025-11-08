package com.zosh.payload.StoreAnalysis;

import com.zosh.domain.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentSaleDTO {
    private Long orderId;
    private String branchName;
    private Double totalAmount;
    private LocalDateTime createdAt;
    private PaymentType paymentType;
}
