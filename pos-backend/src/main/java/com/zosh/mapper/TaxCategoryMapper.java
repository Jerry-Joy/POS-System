package com.zosh.mapper;

import com.zosh.modal.Store;
import com.zosh.modal.TaxCategory;
import com.zosh.payload.dto.TaxCategoryDTO;

public class TaxCategoryMapper {

    public static TaxCategoryDTO toDto(TaxCategory taxCategory) {
        if (taxCategory == null) {
            return null;
        }

        return TaxCategoryDTO.builder()
                .id(taxCategory.getId())
                .name(taxCategory.getName())
                .description(taxCategory.getDescription())
                .percentage(taxCategory.getPercentage())
                .taxType(taxCategory.getTaxType())
                .isActive(taxCategory.getIsActive())
                .storeId(taxCategory.getStore() != null ? taxCategory.getStore().getId() : null)
                .createdAt(taxCategory.getCreatedAt())
                .updatedAt(taxCategory.getUpdatedAt())
                .build();
    }

    public static TaxCategory toEntity(TaxCategoryDTO dto, Store store) {
        if (dto == null) {
            return null;
        }

        return TaxCategory.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .percentage(dto.getPercentage())
                .taxType(dto.getTaxType())
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .store(store)
                .build();
    }
}
