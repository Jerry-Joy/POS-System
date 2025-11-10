package com.zosh.mapper;


import com.zosh.modal.Order;
import com.zosh.modal.OrderTaxBreakdown;
import com.zosh.payload.dto.OrderDTO;
import com.zosh.payload.dto.OrderTaxBreakdownDTO;

import java.util.Collections;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toDto(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .discount(order.getDiscount())
                .loyaltyPointsUsed(order.getLoyaltyPointsUsed())
                .branchId(order.getBranch().getId())
                .cashierId(order.getCashier().getId())
                .customer(order.getCustomer())
                .createdAt(order.getCreatedAt())
                .paymentType(order.getPaymentType())
                .status(order.getStatus())
                .items(order.getItems().stream()
                        .map(OrderItemMapper::toDto)
                        .collect(Collectors.toList()))
                .taxBreakdowns(order.getTaxBreakdowns() != null ?
                        order.getTaxBreakdowns().stream()
                                .map(OrderMapper::toTaxBreakdownDto)
                                .collect(Collectors.toList()) :
                        Collections.emptyList())
                .build();
    }

    private static OrderTaxBreakdownDTO toTaxBreakdownDto(OrderTaxBreakdown breakdown) {
        return OrderTaxBreakdownDTO.builder()
                .id(breakdown.getId())
                .orderId(breakdown.getOrder().getId())
                .taxCategoryId(breakdown.getTaxCategory().getId())
                .taxCategoryName(breakdown.getTaxCategoryName())
                .taxableAmount(breakdown.getTaxableAmount())
                .taxAmount(breakdown.getTaxAmount())
                .taxPercentage(breakdown.getTaxPercentage())
                .build();
    }
}

