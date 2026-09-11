package com.shopsphere.service;

import com.shopsphere.dto.OrderResponse;
import com.shopsphere.entity.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(Long userId);

    List<OrderResponse> getMyOrders(Long userId);

    OrderResponse getMyOrder(
            Long userId,
            Long orderId);

    List<OrderResponse> getAllOrders();

    OrderResponse updateOrderStatus(
            Long orderId,
            OrderStatus status);
}