package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.PaymentOrderResponse;
import com.shopsphere.dto.PaymentVerificationRequest;
import com.shopsphere.entity.User;
import com.shopsphere.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

        private final PaymentService paymentService;

        @PostMapping("/create/{orderId}")
        public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPaymentOrder(
                        @PathVariable Long orderId,
                        Authentication authentication) {

                User user = (User) authentication.getPrincipal();

                PaymentOrderResponse paymentOrder = paymentService.createRazorpayOrder(
                                user.getId(),
                                orderId);

                ApiResponse<PaymentOrderResponse> response = ApiResponse.<PaymentOrderResponse>builder()
                                .success(true)
                                .message("Razorpay order created successfully")
                                .data(paymentOrder)
                                .build();

                return ResponseEntity.ok(response);
        }

        @PostMapping("/verify")
        public ResponseEntity<ApiResponse<Void>> verifyPayment(
                        @RequestBody PaymentVerificationRequest request,
                        Authentication authentication) {

                User user = (User) authentication.getPrincipal();

                paymentService.verifyPayment(
                                user.getId(),
                                request);

                ApiResponse<Void> response = ApiResponse.<Void>builder()
                                .success(true)
                                .message("Payment verified successfully")
                                .build();

                return ResponseEntity.ok(response);
        }
}