package com.zosh.service.impl;

import com.zosh.domain.TaxType;
import com.zosh.modal.*;
import com.zosh.payload.dto.TaxCalculationResult;
import com.zosh.repository.BranchRepository;
import com.zosh.repository.TaxCategoryRepository;
import com.zosh.service.TaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxServiceImpl implements TaxService {

    private final TaxCategoryRepository taxCategoryRepository;
    private final BranchRepository branchRepository;

    @Override
    @Transactional(readOnly = true)
    public TaxCalculationResult calculateOrderTax(List<OrderItem> items, Long branchId) {
        
        // Get branch to access store
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        // Group items by tax category
        Map<TaxCategory, Double> taxCategoryAmounts = new HashMap<>();

        for (OrderItem item : items) {
            Product product = item.getProduct();
            Double itemTotal = item.getPrice(); // Price already includes quantity

            // Skip tax-exempt products
            if (product.getTaxExempt() != null && product.getTaxExempt()) {
                continue;
            }

            // Get tax category for the product
            TaxCategory taxCategory = product.getTaxCategory();
            
            // If no tax category, use branch's default tax percentage
            if (taxCategory == null) {
                Double branchTaxPercentage = branch.getTaxPercentage() != null ? branch.getTaxPercentage() : 18.0;
                taxCategory = getOrCreateDefaultTaxCategory(branch.getStore().getId(), branchTaxPercentage);
            }

            // Accumulate amounts by tax category
            taxCategoryAmounts.merge(taxCategory, itemTotal, Double::sum);
        }

        // Calculate tax for each category
        TaxCalculationResult result = TaxCalculationResult.builder()
                .totalTax(0.0)
                .taxableAmount(0.0)
                .build();

        for (Map.Entry<TaxCategory, Double> entry : taxCategoryAmounts.entrySet()) {
            TaxCategory taxCategory = entry.getKey();
            Double taxableAmount = entry.getValue();

            Double taxAmount = taxCategory.calculateTax(taxableAmount);

            // Add to result
            result.setTotalTax(result.getTotalTax() + taxAmount);
            result.setTaxableAmount(result.getTaxableAmount() + taxableAmount);

            // Add breakdown item
            result.getBreakdown().add(TaxCalculationResult.TaxBreakdownItem.builder()
                    .taxCategoryId(taxCategory.getId())
                    .taxCategoryName(taxCategory.getName())
                    .percentage(taxCategory.getPercentage() != null ? taxCategory.getPercentage() : 0.0)
                    .taxableAmount(taxableAmount)
                    .taxAmount(taxAmount)
                    .build());
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateProductTax(Product product, Integer quantity, Long branchId) {
        
        // Skip tax-exempt products
        if (product.getTaxExempt() != null && product.getTaxExempt()) {
            return 0.0;
        }

        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        TaxCategory taxCategory = product.getTaxCategory();
        
        // If no tax category, use branch's default
        if (taxCategory == null) {
            taxCategory = getOrCreateDefaultTaxCategory(branch.getStore().getId(), branch.getTaxPercentage());
        }

        Double itemTotal = product.getSellingPrice() * quantity;
        return taxCategory.calculateTax(itemTotal);
    }

    @Override
    @Transactional(readOnly = true)
    public TaxCategory getDefaultTaxCategory(Long storeId) {
        return taxCategoryRepository.findByStoreIdAndName(storeId, "Standard Rate")
                .orElse(null);
    }

    @Override
    @Transactional
    public void createDefaultTaxCategories(Long storeId) {
        Store store = new Store();
        store.setId(storeId);

        // Check if default categories already exist
        if (!taxCategoryRepository.existsByStoreIdAndName(storeId, "Standard Rate")) {
            // Create Standard Rate (18% GST)
            TaxCategory standardRate = TaxCategory.builder()
                    .name("Standard Rate")
                    .description("Standard GST rate applicable to most goods and services")
                    .percentage(18.0)
                    .taxType(TaxType.EXCLUSIVE)
                    .isActive(true)
                    .store(store)
                    .build();
            taxCategoryRepository.save(standardRate);
        }

        if (!taxCategoryRepository.existsByStoreIdAndName(storeId, "Reduced Rate")) {
            // Create Reduced Rate (5% GST)
            TaxCategory reducedRate = TaxCategory.builder()
                    .name("Reduced Rate")
                    .description("Reduced GST rate for essential goods")
                    .percentage(5.0)
                    .taxType(TaxType.EXCLUSIVE)
                    .isActive(true)
                    .store(store)
                    .build();
            taxCategoryRepository.save(reducedRate);
        }

        if (!taxCategoryRepository.existsByStoreIdAndName(storeId, "Zero Rate")) {
            // Create Zero Rate (0% - Tax Exempt)
            TaxCategory zeroRate = TaxCategory.builder()
                    .name("Zero Rate")
                    .description("Zero-rated or tax-exempt items")
                    .percentage(0.0)
                    .taxType(TaxType.EXCLUSIVE)
                    .isActive(true)
                    .store(store)
                    .build();
            taxCategoryRepository.save(zeroRate);
        }
    }

    /**
     * Get or create a tax category with the given percentage
     * Used when a product doesn't have a specific tax category
     */
    private TaxCategory getOrCreateDefaultTaxCategory(Long storeId, Double percentage) {
        // Ensure percentage is never null
        Double safePercentage = percentage != null ? percentage : 18.0;
        String categoryName = "Tax " + safePercentage + "%";
        
        return taxCategoryRepository.findByStoreIdAndName(storeId, categoryName)
                .orElseGet(() -> {
                    Store store = new Store();
                    store.setId(storeId);
                    
                    TaxCategory newCategory = TaxCategory.builder()
                            .name(categoryName)
                            .description("Auto-generated tax category")
                            .percentage(safePercentage)
                            .taxType(TaxType.EXCLUSIVE)
                            .isActive(true)
                            .store(store)
                            .build();
                    return taxCategoryRepository.save(newCategory);
                });
    }
}
