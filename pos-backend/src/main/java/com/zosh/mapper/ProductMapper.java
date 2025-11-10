package com.zosh.mapper;

import com.zosh.modal.Category;
import com.zosh.modal.Product;
import com.zosh.modal.Store;
import com.zosh.modal.TaxCategory;
import com.zosh.payload.dto.ProductDTO;

public class ProductMapper {

    public static ProductDTO toDto(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .mrp(product.getMrp())
                .sellingPrice(product.getSellingPrice())
                .brand(product.getBrand())
                .category(product.getCategory().getName())
                .categoryId(product.getCategory().getId())
                .storeId(product.getStore() != null ? product.getStore().getId() : null)
                .image(product.getImage())
                .taxCategoryId(product.getTaxCategory() != null ? product.getTaxCategory().getId() : null)
                .taxCategory(product.getTaxCategory() != null ? TaxCategoryMapper.toDto(product.getTaxCategory()) : null)
                .taxExempt(product.getTaxExempt())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static Product toEntity(ProductDTO dto,
                                   Store store,
                                   Category category,
                                   TaxCategory taxCategory) {
        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .sku(dto.getSku())
                .description(dto.getDescription())
                .mrp(dto.getMrp())
                .sellingPrice(dto.getSellingPrice())
                .brand(dto.getBrand())
                .category(category)
                .taxCategory(taxCategory)
                .taxExempt(dto.getTaxExempt() != null ? dto.getTaxExempt() : false)
                .store(store)
                .image(dto.getImage())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
