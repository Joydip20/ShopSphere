package com.shopsphere.service.impl;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderStatus;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
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
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void getMyOrder_shouldThrowWhenOrderNotFound() {

        when(orderRepository.findByIdAndUserId(99L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> orderService.getMyOrder(1L, 99L));
    }

    @Test
    void updateOrderStatus_shouldUpdateSuccessfully() {

        Order order = Order.builder()
                .id(1L)
                .totalAmount(new BigDecimal("29999.00"))
                .status(OrderStatus.CONFIRMED)
                .build();

        when(orderRepository.findById(1L))
                .thenReturn(Optional.of(order));

        when(orderRepository.save(order))
                .thenReturn(order);

        var result = orderService.updateOrderStatus(
                1L,
                OrderStatus.SHIPPED);

        assertNotNull(result);
        assertEquals(
                OrderStatus.SHIPPED,
                order.getStatus());

        verify(orderRepository)
                .save(order);
    }

    @Test
    void updateOrderStatus_shouldRejectNullStatus() {

        assertThrows(
                BadRequestException.class,
                () -> orderService.updateOrderStatus(
                        1L,
                        null));

        verify(orderRepository, never())
                .findById(anyLong());
    }

    @Test
    void updateOrderStatus_shouldThrowWhenOrderNotFound() {

        when(orderRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> orderService.updateOrderStatus(
                        99L,
                        OrderStatus.SHIPPED));
    }
}