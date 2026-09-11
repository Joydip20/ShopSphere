package com.shopsphere.service;

import com.shopsphere.dto.PaymentOrderResponse;
import com.shopsphere.dto.PaymentVerificationRequest;

public interface PaymentService {

    PaymentOrderResponse createRazorpayOrder(
            Long userId,
            Long orderId);

    void verifyPayment(
            Long userId,
            PaymentVerificationRequest request);
}