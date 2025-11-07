package com.zosh.payload.dto;


import com.zosh.domain.OrderStatus;
import com.zosh.domain.PaymentType;
import com.zosh.modal.Customer;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Double totalAmount;
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Integer loyaltyPointsUsed;
    private Long branchId;
    private Long cashierId;
    private Customer customer;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private PaymentType paymentType;
    private OrderStatus status;
}
