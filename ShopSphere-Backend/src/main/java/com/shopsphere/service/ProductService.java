package com.shopsphere.service;

import com.shopsphere.dto.ProductDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    ProductDTO createProduct(ProductDTO dto);

    ProductDTO getProductById(Long id);

    ProductDTO updateProduct(Long id, ProductDTO dto);

    void deleteProduct(Long id);

    List<ProductDTO> searchProducts(String keyword);

    List<ProductDTO> getProductsByCategory(String category);

    Page<ProductDTO> getAllProducts(
            int page,
            int size,
            String sortBy,
            String direction,
            String keyword,
            String category);
}