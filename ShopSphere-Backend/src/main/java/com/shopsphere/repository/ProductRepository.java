package com.shopsphere.repository;

import com.shopsphere.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

        boolean existsByNameIgnoreCase(String name);

        List<Product> findByNameContainingIgnoreCase(String keyword);

        List<Product> findByCategoryIgnoreCase(String category);

        @Query("""
                        SELECT p FROM Product p
                        WHERE
                        (
                            :keyword IS NULL OR :keyword = ''
                            OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        )
                        AND
                        (
                            :category IS NULL OR :category = ''
                            OR LOWER(p.category) = LOWER(:category)
                        )
                        """)
        Page<Product> findProducts(
                        @Param("keyword") String keyword,
                        @Param("category") String category,
                        Pageable pageable);
}