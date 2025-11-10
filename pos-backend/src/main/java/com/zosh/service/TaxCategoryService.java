package com.zosh.service;

import com.zosh.payload.dto.TaxCategoryDTO;

import java.util.List;

public interface TaxCategoryService {
    
    TaxCategoryDTO createTaxCategory(TaxCategoryDTO dto);
    
    TaxCategoryDTO updateTaxCategory(Long id, TaxCategoryDTO dto);
    
    TaxCategoryDTO getTaxCategoryById(Long id);
    
    List<TaxCategoryDTO> getTaxCategoriesByStore(Long storeId);
    
    List<TaxCategoryDTO> getActiveTaxCategoriesByStore(Long storeId);
    
    void deleteTaxCategory(Long id);
    
    void activateTaxCategory(Long id);
    
    void deactivateTaxCategory(Long id);
}
