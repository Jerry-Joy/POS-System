package com.zosh.service;

import com.zosh.modal.Order;
import com.zosh.modal.OrderItem;
import com.zosh.modal.Product;
import com.zosh.payload.dto.TaxCalculationResult;

import java.util.List;

/**
 * Service for tax calculation and management
 */
public interface TaxService {
    
    /**
     * Calculate tax for an order based on its items
     * @param items List of order items
     * @param branchId Branch ID for location-specific tax
     * @return Tax calculation result with breakdown
     */
    TaxCalculationResult calculateOrderTax(List<OrderItem> items, Long branchId);
    
    /**
     * Calculate tax for a single product
     * @param product Product to calculate tax for
     * @param quantity Quantity of the product
     * @param branchId Branch ID for location-specific tax
     * @return Tax amount
     */
    Double calculateProductTax(Product product, Integer quantity, Long branchId);
    
    /**
     * Get default tax category for a store
     * @param storeId Store ID
     * @return Default tax category or null
     */
    com.zosh.modal.TaxCategory getDefaultTaxCategory(Long storeId);
    
    /**
     * Create default tax categories for a store
     * @param storeId Store ID
     */
    void createDefaultTaxCategories(Long storeId);
}
