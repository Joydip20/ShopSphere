package com.shopsphere.service.impl;

import com.shopsphere.dto.AddToCartRequest;
import com.shopsphere.dto.CartItemResponse;
import com.shopsphere.dto.CartResponse;
import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public CartResponse addToCart(
            Long userId,
            AddToCartRequest request) {

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: "
                                + request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException(
                    "Insufficient stock");
        }

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseGet(() -> {

                    Cart newCart = Cart.builder()
                            .user(
                                    com.shopsphere.entity.User
                                            .builder()
                                            .id(userId)
                                            .build())
                            .build();

                    return cartRepository.save(newCart);
                });

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        product.getId())
                .orElse(null);

        if (cartItem != null) {

            int newQuantity = cartItem.getQuantity()
                    + request.getQuantity();

            if (newQuantity > product.getStock()) {
                throw new BadRequestException(
                        "Requested quantity exceeds available stock");
            }

            cartItem.setQuantity(newQuantity);

        } else {

            cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        }

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseGet(() -> Cart.builder()
                        .user(
                                com.shopsphere.entity.User
                                        .builder()
                                        .id(userId)
                                        .build())
                        .build());

        if (cart.getId() == null) {
            cart = cartRepository.save(cart);
        }

        return buildCartResponse(cart);
    }

    private CartResponse buildCartResponse(Cart cart) {

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        List<CartItemResponse> items = cartItems.stream()
                .map(this::mapToResponse)
                .toList();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .totalAmount(totalAmount)
                .build();
    }

    private CartItemResponse mapToResponse(
            CartItem cartItem) {

        Product product = cartItem.getProduct();

        BigDecimal subtotal = product.getPrice()
                .multiply(
                        BigDecimal.valueOf(
                                cartItem.getQuantity()));

        return CartItemResponse.builder()
                .cartItemId(cartItem.getId())
                .productId(product.getId())
                .productName(product.getName())
                .price(product.getPrice())
                .imageUrl(product.getImageUrl())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(
            Long userId,
            Long cartItemId,
            Integer quantity) {

        if (quantity == null || quantity < 1) {
            throw new BadRequestException(
                    "Quantity must be at least 1");
        }

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item not found with id: "
                                + cartItemId));

        if (!cartItem.getCart()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BadRequestException(
                    "You cannot modify another user's cart");
        }

        Product product = cartItem.getProduct();

        if (quantity > product.getStock()) {
            throw new BadRequestException(
                    "Requested quantity exceeds available stock");
        }

        cartItem.setQuantity(quantity);

        cartItemRepository.save(cartItem);

        return buildCartResponse(cartItem.getCart());
    }

    @Override
    @Transactional
    public CartResponse removeCartItem(
            Long userId,
            Long cartItemId) {

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cart item not found with id: "
                                + cartItemId));

        if (!cartItem.getCart()
                .getUser()
                .getId()
                .equals(userId)) {

            throw new BadRequestException(
                    "You cannot modify another user's cart");
        }

        Cart cart = cartItem.getCart();

        cartItemRepository.delete(cartItem);

        return buildCartResponse(cart);
    }
}