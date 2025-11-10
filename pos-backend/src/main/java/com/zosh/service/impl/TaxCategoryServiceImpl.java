package com.zosh.service.impl;

import com.zosh.mapper.TaxCategoryMapper;
import com.zosh.modal.Store;
import com.zosh.modal.TaxCategory;
import com.zosh.payload.dto.TaxCategoryDTO;
import com.zosh.repository.StoreRepository;
import com.zosh.repository.TaxCategoryRepository;
import com.zosh.service.TaxCategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxCategoryServiceImpl implements TaxCategoryService {

    private final TaxCategoryRepository taxCategoryRepository;
    private final StoreRepository storeRepository;

    @Override
    @Transactional
    public TaxCategoryDTO createTaxCategory(TaxCategoryDTO dto) {
        
        // Check if tax category with same name exists for this store
        if (taxCategoryRepository.existsByStoreIdAndName(dto.getStoreId(), dto.getName())) {
            throw new IllegalArgumentException("Tax category with name '" + dto.getName() + "' already exists for this store");
        }

        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        TaxCategory taxCategory = TaxCategoryMapper.toEntity(dto, store);
        TaxCategory saved = taxCategoryRepository.save(taxCategory);
        
        return TaxCategoryMapper.toDto(saved);
    }

    @Override
    @Transactional
    public TaxCategoryDTO updateTaxCategory(Long id, TaxCategoryDTO dto) {
        
        TaxCategory existing = taxCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tax category not found"));

        // Check if name is being changed and if it conflicts
        if (!existing.getName().equals(dto.getName()) && 
            taxCategoryRepository.existsByStoreIdAndName(existing.getStore().getId(), dto.getName())) {
            throw new IllegalArgumentException("Tax category with name '" + dto.getName() + "' already exists for this store");
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPercentage(dto.getPercentage());
        existing.setTaxType(dto.getTaxType());
        
        if (dto.getIsActive() != null) {
            existing.setIsActive(dto.getIsActive());
        }

        TaxCategory updated = taxCategoryRepository.save(existing);
        return TaxCategoryMapper.toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public TaxCategoryDTO getTaxCategoryById(Long id) {
        return taxCategoryRepository.findById(id)
                .map(TaxCategoryMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Tax category not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaxCategoryDTO> getTaxCategoriesByStore(Long storeId) {
        return taxCategoryRepository.findByStoreId(storeId).stream()
                .map(TaxCategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaxCategoryDTO> getActiveTaxCategoriesByStore(Long storeId) {
        return taxCategoryRepository.findByStoreIdAndIsActive(storeId, true).stream()
                .map(TaxCategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTaxCategory(Long id) {
        if (!taxCategoryRepository.existsById(id)) {
            throw new EntityNotFoundException("Tax category not found");
        }
        taxCategoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void activateTaxCategory(Long id) {
        TaxCategory taxCategory = taxCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tax category not found"));
        taxCategory.setIsActive(true);
        taxCategoryRepository.save(taxCategory);
    }

    @Override
    @Transactional
    public void deactivateTaxCategory(Long id) {
        TaxCategory taxCategory = taxCategoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tax category not found"));
        taxCategory.setIsActive(false);
        taxCategoryRepository.save(taxCategory);
    }
}
