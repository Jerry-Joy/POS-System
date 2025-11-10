package com.zosh.repository;

import com.zosh.modal.OrderTaxBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderTaxBreakdownRepository extends JpaRepository<OrderTaxBreakdown, Long> {
    
    List<OrderTaxBreakdown> findByOrderId(Long orderId);
    
    List<OrderTaxBreakdown> findByTaxCategoryId(Long taxCategoryId);
}
