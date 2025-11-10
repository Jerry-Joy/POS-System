package com.zosh.service.impl;


import com.zosh.domain.UserRole;
import com.zosh.exception.AccessDeniedException;
import com.zosh.mapper.ProductMapper;
import com.zosh.modal.Category;
import com.zosh.modal.Product;
import com.zosh.modal.Store;
import com.zosh.modal.TaxCategory;
import com.zosh.modal.User;
import com.zosh.payload.dto.ProductDTO;
import com.zosh.repository.CategoryRepository;
import com.zosh.repository.ProductRepository;
import com.zosh.repository.StoreRepository;
import com.zosh.repository.TaxCategoryRepository;
import com.zosh.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;
    private final TaxCategoryRepository taxCategoryRepository;

    @Override
    public ProductDTO createProduct(ProductDTO dto, User user) throws AccessDeniedException {
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        checkAuthority(store, user);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        // Handle tax category (optional)
        TaxCategory taxCategory = null;
        if (dto.getTaxCategoryId() != null) {
            taxCategory = taxCategoryRepository.findById(dto.getTaxCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Tax category not found"));
        }

        Product product = ProductMapper.toEntity(dto, store, category, taxCategory);
        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        return ProductMapper.toDto(product);
    }



    @Override
    public ProductDTO updateProduct(Long id, ProductDTO dto, User user) throws AccessDeniedException {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        Category category=categoryRepository.findById(dto.getCategoryId()).orElseThrow(
                () -> new EntityNotFoundException("Category not found")
        );

        checkAuthority(existing.getStore(),user);

        existing.setName(dto.getName());
        existing.setSku(dto.getSku());
        existing.setDescription(dto.getDescription());
        existing.setMrp(dto.getMrp());
        existing.setSellingPrice(dto.getSellingPrice());
        existing.setBrand(dto.getBrand());
        existing.setImage(dto.getImage());
        existing.setCategory(category);

        // Handle tax category update
        if (dto.getTaxCategoryId() != null) {
            TaxCategory taxCategory = taxCategoryRepository.findById(dto.getTaxCategoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Tax category not found"));
            existing.setTaxCategory(taxCategory);
        } else {
            existing.setTaxCategory(null);
        }
        
        // Handle tax exempt flag
        existing.setTaxExempt(dto.getTaxExempt() != null ? dto.getTaxExempt() : false);

        if (dto.getStoreId() != null) {
            Store store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new EntityNotFoundException("Store not found"));
            existing.setStore(store);
        }

        return ProductMapper.toDto(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(Long id, User user) throws AccessDeniedException {
        Product product=productRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Product not found")
        );
       checkAuthority(product.getStore(),user);
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDTO> getProductsByStoreId(Long storeId) {
        return productRepository.findByStoreId(storeId)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> searchByKeyword(Long storeId , String query ) {
        return productRepository.searchByKeyword(storeId, query)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    public void checkAuthority(Store store, User user) throws AccessDeniedException {

        if(user.getRole()==UserRole.ROLE_STORE_MANAGER
                && user.getStore().getId().equals(store.getId())){
            return;
        }

        if (user.getRole() == UserRole.ROLE_STORE_ADMIN
                && store.getStoreAdmin().getId().equals(user.getId())) {
            return;
        }

        throw new AccessDeniedException("You are not authorized to manage this store.");

    }



}

