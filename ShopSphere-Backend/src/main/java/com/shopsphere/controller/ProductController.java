package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.ProductDTO;
import com.shopsphere.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @Valid @RequestBody ProductDTO dto) {

        ProductDTO savedProduct = productService.createProduct(dto);

        ApiResponse<ProductDTO> response = ApiResponse.<ProductDTO>builder()
                .success(true)
                .message("Product created successfully")
                .data(savedProduct)
                .build();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAllProducts(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "id") String sortBy,

            @RequestParam(defaultValue = "asc") String direction) {

        Page<ProductDTO> products = productService.getAllProducts(
                page,
                size,
                sortBy,
                direction);

        ApiResponse<Page<ProductDTO>> response = ApiResponse.<Page<ProductDTO>>builder()
                .success(true)
                .message("Products fetched successfully")
                .data(products)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> searchProducts(
            @RequestParam String keyword) {

        List<ProductDTO> products = productService.searchProducts(keyword);

        ApiResponse<List<ProductDTO>> response = ApiResponse.<List<ProductDTO>>builder()
                .success(true)
                .message("Products fetched successfully")
                .data(products)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductDTO dto) {

        return ResponseEntity.ok(
                productService.updateProduct(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getProductsByCategory(
            @PathVariable String category) {

        List<ProductDTO> products = productService.getProductsByCategory(category);

        ApiResponse<List<ProductDTO>> response = ApiResponse.<List<ProductDTO>>builder()
                .success(true)
                .message("Products fetched successfully")
                .data(products)
                .build();

        return ResponseEntity.ok(response);
    }

}