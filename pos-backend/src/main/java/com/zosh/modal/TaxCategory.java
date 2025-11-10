package com.zosh.modal;

import com.zosh.domain.TaxType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Tax Category entity to manage different tax rates and rules
 * Examples: Standard Rate (18%), Reduced Rate (5%), Zero Rate (0%)
 */
@Entity
@Table(name = "tax_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Standard Rate", "Reduced Rate", "Zero Rate"

    private String description; // e.g., "Standard GST applicable to most goods"

    @Column(nullable = false)
    private Double percentage; // e.g., 18.0 for 18% GST

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaxType taxType = TaxType.EXCLUSIVE; // Default to exclusive tax

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true; // Whether this tax category is currently active

    @ManyToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Calculate tax amount based on the base price
     * @param basePrice The price before tax (for EXCLUSIVE) or including tax (for INCLUSIVE)
     * @return The tax amount
     */
    public Double calculateTax(Double basePrice) {
        if (basePrice == null || basePrice <= 0) {
            return 0.0;
        }

        if (taxType == TaxType.INCLUSIVE) {
            // Tax is already included in price
            // Tax = Price - (Price / (1 + rate))
            return basePrice - (basePrice / (1 + percentage / 100));
        } else {
            // Tax is added on top of price
            // Tax = Price * rate
            return basePrice * (percentage / 100);
        }
    }

    /**
     * Calculate the base price (price without tax) from a total price
     * Useful when tax is inclusive
     */
    public Double getBasePrice(Double totalPrice) {
        if (totalPrice == null || totalPrice <= 0) {
            return 0.0;
        }

        if (taxType == TaxType.INCLUSIVE) {
            return totalPrice / (1 + percentage / 100);
        } else {
            return totalPrice;
        }
    }
}
