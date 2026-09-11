package com.shopsphere.service.impl;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderStatus;
import com.shopsphere.entity.Payment;
import com.shopsphere.entity.PaymentStatus;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.dto.PaymentVerificationRequest;
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
class PaymentServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Test
    void createPayment_shouldRejectNonPendingOrder() {

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(new BigDecimal("29999.00"))
                .build();

        when(orderRepository.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                BadRequestException.class,
                () -> paymentService.createRazorpayOrder(
                        1L,
                        1L));

        verify(paymentRepository, never())
                .save(any(Payment.class));
    }

    @Test
    void createPayment_shouldRejectAlreadySuccessfulPayment() {

        Order order = Order.builder()
                .id(1L)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("29999.00"))
                .build();

        Payment payment = Payment.builder()
                .order(order)
                .status(PaymentStatus.SUCCESS)
                .amount(new BigDecimal("29999.00"))
                .build();

        when(orderRepository.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(order));

        when(paymentRepository.findByOrderId(1L))
                .thenReturn(Optional.of(payment));

        assertThrows(
                BadRequestException.class,
                () -> paymentService.createRazorpayOrder(
                        1L,
                        1L));
    }

    @Test
    void verifyPayment_shouldRejectNullRequest() {

        assertThrows(
                BadRequestException.class,
                () -> paymentService.verifyPayment(
                        1L,
                        null));

        verify(paymentRepository, never())
                .findByRazorpayOrderId(anyString());
    }

    @Test
    void verifyPayment_shouldRejectIncompleteRequest() {

        PaymentVerificationRequest request = PaymentVerificationRequest.builder()
                .razorpayOrderId("order_test")
                .razorpayPaymentId(null)
                .razorpaySignature("signature")
                .build();

        assertThrows(
                BadRequestException.class,
                () -> paymentService.verifyPayment(
                        1L,
                        request));
    }
}