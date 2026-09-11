package com.shopsphere.service;

import com.shopsphere.dto.AddToCartRequest;
import com.shopsphere.dto.CartResponse;

public interface CartService {

    CartResponse addToCart(
            Long userId,
            AddToCartRequest request);

    CartResponse getCart(Long userId);

    CartResponse updateCartItem(
            Long userId,
            Long cartItemId,
            Integer quantity);

    CartResponse removeCartItem(
            Long userId,
            Long cartItemId);
}