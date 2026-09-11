package com.shopsphere.service.impl;

import com.shopsphere.dto.ProductDTO;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ProductMapper;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.ProductService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductDTO createProduct(ProductDTO dto) {

        if (productRepository.existsByNameIgnoreCase(dto.getName())) {

            throw new BadRequestException(
                    "Product with this name already exists");
        }

        Product product = productMapper.dtoToEntity(dto);

        Product savedProduct = productRepository.save(product);

        return productMapper.entityToDto(savedProduct);
    }

    @Override
    public ProductDTO getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));

        return productMapper.entityToDto(product);
    }

    @Override
    public ProductDTO updateProduct(
            Long id,
            ProductDTO dto) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));

        existingProduct.setName(dto.getName());
        existingProduct.setDescription(dto.getDescription());
        existingProduct.setPrice(dto.getPrice());
        existingProduct.setStock(dto.getStock());
        existingProduct.setCategory(dto.getCategory());
        existingProduct.setImageUrl(dto.getImageUrl());

        Product updatedProduct = productRepository.save(existingProduct);

        return productMapper.entityToDto(updatedProduct);
    }

    @Override
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Product not found with id: " + id);
        }

        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDTO> searchProducts(String keyword) {

        return productRepository
                .findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(productMapper::entityToDto)
                .toList();
    }

    @Override
    public List<ProductDTO> getProductsByCategory(
            String category) {

        return productRepository
                .findByCategoryIgnoreCase(category)
                .stream()
                .map(productMapper::entityToDto)
                .toList();
    }

    @Override
    public Page<ProductDTO> getAllProducts(
            int page,
            int size,
            String sortBy,
            String direction,
            String keyword,
            String category) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository
                .findProducts(keyword, category, pageable)
                .map(productMapper::entityToDto);
    }
}