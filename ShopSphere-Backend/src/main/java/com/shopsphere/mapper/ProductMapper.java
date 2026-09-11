package com.shopsphere.mapper;

import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product dtoToEntity(ProductDTO dto) {

        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .build();
    }

    public ProductDTO entityToDto(Product product) {

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .build();
    }
}