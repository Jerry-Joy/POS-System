package com.zosh.controller;

import com.zosh.payload.dto.TaxCategoryDTO;
import com.zosh.service.TaxCategoryService;
import com.zosh.service.TaxService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tax-categories")
@RequiredArgsConstructor
public class TaxCategoryController {

    private final TaxCategoryService taxCategoryService;
    private final TaxService taxService;

    @PostMapping
    @PreAuthorize("hasAuthority('STORE_ADMIN')")
    public ResponseEntity<TaxCategoryDTO> createTaxCategory(@RequestBody TaxCategoryDTO dto) {
        TaxCategoryDTO created = taxCategoryService.createTaxCategory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('STORE_ADMIN')")
    public ResponseEntity<TaxCategoryDTO> updateTaxCategory(
            @PathVariable Long id,
            @RequestBody TaxCategoryDTO dto) {
        TaxCategoryDTO updated = taxCategoryService.updateTaxCategory(id, dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxCategoryDTO> getTaxCategoryById(@PathVariable Long id) {
        TaxCategoryDTO taxCategory = taxCategoryService.getTaxCategoryById(id);
        return ResponseEntity.ok(taxCategory);
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<TaxCategoryDTO>> getTaxCategoriesByStore(@PathVariable Long storeId) {
        List<TaxCategoryDTO> categories = taxCategoryService.getTaxCategoriesByStore(storeId);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/store/{storeId}/active")
    public ResponseEntity<List<TaxCategoryDTO>> getActiveTaxCategoriesByStore(@PathVariable Long storeId) {
        List<TaxCategoryDTO> categories = taxCategoryService.getActiveTaxCategoriesByStore(storeId);
        return ResponseEntity.ok(categories);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('STORE_ADMIN')")
    public ResponseEntity<Void> deleteTaxCategory(@PathVariable Long id) {
        taxCategoryService.deleteTaxCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('STORE_ADMIN')")
    public ResponseEntity<Void> activateTaxCategory(@PathVariable Long id) {
        taxCategoryService.activateTaxCategory(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('STORE_ADMIN')")
    public ResponseEntity<Void> deactivateTaxCategory(@PathVariable Long id) {
        taxCategoryService.deactivateTaxCategory(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/store/{storeId}/init-defaults")
    @PreAuthorize("hasAuthority('STORE_ADMIN')")
    public ResponseEntity<String> initializeDefaultTaxCategories(@PathVariable Long storeId) {
        taxService.createDefaultTaxCategories(storeId);
        return ResponseEntity.ok("Default tax categories created successfully");
    }
}
