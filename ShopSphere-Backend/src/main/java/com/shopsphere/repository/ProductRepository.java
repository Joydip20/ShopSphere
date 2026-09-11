package com.shopsphere.repository;

import com.shopsphere.entity.Product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
                extends JpaRepository<Product, Long> {

        boolean existsByNameIgnoreCase(String name);

        List<Product> findByNameContainingIgnoreCase(String keyword);

        List<Product> findByCategoryIgnoreCase(String category);
}