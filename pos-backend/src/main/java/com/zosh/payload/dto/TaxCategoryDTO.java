package com.zosh.payload.dto;

import com.zosh.domain.TaxType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private Double percentage;
    private TaxType taxType;
    private Boolean isActive;
    private Long storeId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
