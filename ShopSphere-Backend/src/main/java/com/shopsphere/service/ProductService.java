package com.shopsphere.service;

import com.shopsphere.dto.ProductDTO;

import java.util.List;

import org.springframework.data.domain.Page;

public interface ProductService {

    ProductDTO createProduct(ProductDTO dto);

    List<ProductDTO> getAllProducts();

    ProductDTO getProductById(Long id);

    ProductDTO updateProduct(Long id, ProductDTO dto);

    void deleteProduct(Long id);

    List<ProductDTO> searchProducts(String keyword);

    List<ProductDTO> getProductsByCategory(String category);

    Page<ProductDTO> getAllProducts(
            int page,
            int size,
            String sortBy,
            String direction);
}