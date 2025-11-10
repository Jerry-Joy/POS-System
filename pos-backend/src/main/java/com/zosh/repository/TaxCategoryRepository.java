package com.zosh.repository;

import com.zosh.modal.TaxCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxCategoryRepository extends JpaRepository<TaxCategory, Long> {
    
    List<TaxCategory> findByStoreId(Long storeId);
    
    List<TaxCategory> findByStoreIdAndIsActive(Long storeId, Boolean isActive);
    
    Optional<TaxCategory> findByStoreIdAndName(Long storeId, String name);
    
    boolean existsByStoreIdAndName(Long storeId, String name);
}
