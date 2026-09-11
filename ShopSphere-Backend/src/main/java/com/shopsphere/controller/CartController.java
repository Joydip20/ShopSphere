package com.shopsphere.controller;

import com.shopsphere.dto.AddToCartRequest;
import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.CartResponse;
import com.shopsphere.entity.User;
import com.shopsphere.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        CartResponse cart = cartService.addToCart(
                user.getId(),
                request);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Product added to cart")
                .data(cart)
                .build();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        CartResponse cart = cartService.getCart(user.getId());

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart retrieved successfully")
                .data(cart)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        CartResponse cart = cartService.updateCartItem(
                user.getId(),
                cartItemId,
                quantity);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart item updated successfully")
                .data(cart)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @PathVariable Long cartItemId,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        CartResponse cart = cartService.removeCartItem(
                user.getId(),
                cartItemId);

        ApiResponse<CartResponse> response = ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart item removed successfully")
                .data(cart)
                .build();

        return ResponseEntity.ok(response);
    }
}