package com.zosh.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * Order Tax Breakdown entity to store detailed tax information per order
 * Useful for tax reporting and compliance
 */
@Entity
@Table(name = "order_tax_breakdown")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTaxBreakdown {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "tax_category_id", nullable = false)
    private TaxCategory taxCategory;

    @Column(nullable = false)
    private Double taxableAmount; // Amount on which tax is calculated

    @Column(nullable = false)
    private Double taxAmount; // Calculated tax amount

    @Column(nullable = false)
    private Double taxPercentage; // Tax percentage at the time of order (for historical accuracy)

    private String taxCategoryName; // Name at the time of order (for historical accuracy)
}
