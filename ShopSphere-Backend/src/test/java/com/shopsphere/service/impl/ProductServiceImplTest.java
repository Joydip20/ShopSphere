package com.shopsphere.service.impl;

import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ProductMapper;
import com.shopsphere.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private ProductDTO productDTO;
    private Product product;

    @BeforeEach
    void setUp() {

        productDTO = ProductDTO.builder()
                .id(1L)
                .name("Laptop")
                .description("Gaming laptop")
                .price(new BigDecimal("99999.00"))
                .stock(10)
                .category("Electronics")
                .imageUrl("laptop.jpg")
                .build();

        product = Product.builder()
                .id(1L)
                .name("Laptop")
                .description("Gaming laptop")
                .price(new BigDecimal("99999.00"))
                .stock(10)
                .category("Electronics")
                .imageUrl("laptop.jpg")
                .build();
    }

    @Test
    void createProduct_shouldCreateProductSuccessfully() {

        when(productRepository.existsByNameIgnoreCase("Laptop"))
                .thenReturn(false);

        when(productMapper.dtoToEntity(productDTO))
                .thenReturn(product);

        when(productRepository.save(product))
                .thenReturn(product);

        when(productMapper.entityToDto(product))
                .thenReturn(productDTO);

        ProductDTO result = productService.createProduct(productDTO);

        assertNotNull(result);
        assertEquals("Laptop", result.getName());
        assertEquals(
                new BigDecimal("99999.00"),
                result.getPrice());

        verify(productRepository)
                .save(product);
    }

    @Test
    void createProduct_shouldRejectDuplicateProduct() {

        when(productRepository.existsByNameIgnoreCase("Laptop"))
                .thenReturn(true);

        assertThrows(
                BadRequestException.class,
                () -> productService.createProduct(productDTO));

        verify(productRepository, never())
                .save(any(Product.class));
    }

    @Test
    void getProductById_shouldReturnProduct() {

        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        when(productMapper.entityToDto(product))
                .thenReturn(productDTO);

        ProductDTO result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Laptop", result.getName());
    }

    @Test
    void getProductById_shouldThrowWhenProductNotFound() {

        when(productRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> productService.getProductById(99L));
    }

    @Test
    void deleteProduct_shouldDeleteExistingProduct() {

        when(productRepository.existsById(1L))
                .thenReturn(true);

        productService.deleteProduct(1L);

        verify(productRepository)
                .deleteById(1L);
    }

    @Test
    void deleteProduct_shouldThrowWhenProductNotFound() {

        when(productRepository.existsById(99L))
                .thenReturn(false);

        assertThrows(
                ResourceNotFoundException.class,
                () -> productService.deleteProduct(99L));

        verify(productRepository, never())
                .deleteById(99L);
    }
}