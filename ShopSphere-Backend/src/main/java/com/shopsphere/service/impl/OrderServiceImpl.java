package com.shopsphere.service.impl;

import com.shopsphere.dto.OrderItemResponse;
import com.shopsphere.dto.OrderResponse;
import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.OrderStatus;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

        private final OrderRepository orderRepository;
        private final CartRepository cartRepository;
        private final CartItemRepository cartItemRepository;
        private final ProductRepository productRepository;

        @Override
        @Transactional
        public OrderResponse createOrder(Long userId) {

                Cart cart = cartRepository
                                .findByUserId(userId)
                                .orElseThrow(() -> new BadRequestException(
                                                "Cart is empty"));

                List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

                if (cartItems.isEmpty()) {
                        throw new BadRequestException(
                                        "Cannot create order with empty cart");
                }

                Order order = Order.builder()
                                .user(cart.getUser())
                                .status(OrderStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .totalAmount(BigDecimal.ZERO)
                                .items(new ArrayList<>())
                                .build();

                BigDecimal totalAmount = BigDecimal.ZERO;

                for (CartItem cartItem : cartItems) {

                        Product product = cartItem.getProduct();

                        if (product.getStock() < cartItem.getQuantity()) {
                                throw new BadRequestException(
                                                "Insufficient stock for product: "
                                                                + product.getName());
                        }

                        BigDecimal subtotal = product.getPrice()
                                        .multiply(
                                                        BigDecimal.valueOf(
                                                                        cartItem.getQuantity()));

                        OrderItem orderItem = OrderItem.builder()
                                        .order(order)
                                        .product(product)
                                        .productName(product.getName())
                                        .price(product.getPrice())
                                        .quantity(cartItem.getQuantity())
                                        .subtotal(subtotal)
                                        .build();

                        order.getItems().add(orderItem);

                        totalAmount = totalAmount.add(subtotal);

                        product.setStock(
                                        product.getStock()
                                                        - cartItem.getQuantity());

                        productRepository.save(product);
                }

                order.setTotalAmount(totalAmount);

                Order savedOrder = orderRepository.save(order);

                cartItemRepository.deleteAll(cartItems);

                return mapToResponse(savedOrder);
        }

        @Override
        @Transactional(readOnly = true)
        public List<OrderResponse> getMyOrders(Long userId) {

                return orderRepository
                                .findByUserIdOrderByCreatedAtDesc(userId)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        @Transactional(readOnly = true)
        public OrderResponse getMyOrder(
                        Long userId,
                        Long orderId) {

                Order order = orderRepository
                                .findByIdAndUserId(orderId, userId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found"));

                return mapToResponse(order);
        }

        /*
         * ADMIN
         * Get all customer orders.
         */
        @Override
        @Transactional(readOnly = true)
        public List<OrderResponse> getAllOrders() {

                return orderRepository
                                .findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        /*
         * ADMIN
         * Update the status of an order.
         */
        @Override
        @Transactional
        public OrderResponse updateOrderStatus(
                        Long orderId,
                        OrderStatus status) {

                if (status == null) {
                        throw new BadRequestException(
                                        "Order status is required");
                }

                Order order = orderRepository
                                .findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found"));

                order.setStatus(status);

                Order updatedOrder = orderRepository.save(order);

                return mapToResponse(updatedOrder);
        }

        /*
         * Convert Order entity to OrderResponse DTO.
         */
        private OrderResponse mapToResponse(
                        Order order) {

                List<OrderItemResponse> items = order.getItems()
                                .stream()
                                .map(item -> OrderItemResponse.builder()
                                                .productId(
                                                                item.getProduct().getId())
                                                .productName(
                                                                item.getProductName())
                                                .price(
                                                                item.getPrice())
                                                .quantity(
                                                                item.getQuantity())
                                                .subtotal(
                                                                item.getSubtotal())
                                                .build())
                                .toList();

                return OrderResponse.builder()
                                .orderId(order.getId())
                                .totalAmount(order.getTotalAmount())
                                .status(order.getStatus())
                                .createdAt(order.getCreatedAt())
                                .items(items)
                                .build();
        }
}