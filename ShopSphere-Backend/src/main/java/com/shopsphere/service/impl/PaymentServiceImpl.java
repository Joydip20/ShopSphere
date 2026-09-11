package com.shopsphere.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.shopsphere.dto.PaymentOrderResponse;
import com.shopsphere.dto.PaymentVerificationRequest;
import com.shopsphere.entity.OrderStatus;
import com.shopsphere.entity.Payment;
import com.shopsphere.entity.PaymentStatus;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

        private final OrderRepository orderRepository;
        private final PaymentRepository paymentRepository;

        @Value("${razorpay.key.id}")
        private String razorpayKeyId;

        @Value("${razorpay.key.secret}")
        private String razorpayKeySecret;

        @Override
        public PaymentOrderResponse createRazorpayOrder(
                        Long userId,
                        Long orderId) {

                com.shopsphere.entity.Order shopSphereOrder = orderRepository.findByIdAndUserId(orderId, userId)
                                .orElseThrow(() -> new BadRequestException(
                                                "Order not found"));

                /*
                 * Payment can only be created for a pending order.
                 */
                if (shopSphereOrder.getStatus() != OrderStatus.PENDING) {

                        throw new BadRequestException(
                                        "Payment cannot be created for this order");
                }

                /*
                 * Check if a payment record already exists.
                 *
                 * SUCCESS -> payment is already completed.
                 * CREATED/FAILED -> allow retry by creating a new
                 * Razorpay order and updating the existing record.
                 */
                Payment existingPayment = paymentRepository.findByOrderId(orderId)
                                .orElse(null);

                if (existingPayment != null
                                && existingPayment.getStatus() == PaymentStatus.SUCCESS) {

                        throw new BadRequestException(
                                        "Payment is already completed for this order");
                }

                BigDecimal amount = shopSphereOrder.getTotalAmount();

                long amountInPaise = amount.multiply(BigDecimal.valueOf(100))
                                .longValueExact();

                try {

                        RazorpayClient razorpayClient = new RazorpayClient(
                                        razorpayKeyId,
                                        razorpayKeySecret);

                        JSONObject orderRequest = new JSONObject();

                        orderRequest.put(
                                        "amount",
                                        amountInPaise);

                        orderRequest.put(
                                        "currency",
                                        "INR");

                        orderRequest.put(
                                        "receipt",
                                        "SHOPSPHERE_" + orderId);

                        Order razorpayOrder = razorpayClient.orders.create(
                                        orderRequest);

                        String razorpayOrderId = razorpayOrder.get("id");

                        Payment payment;

                        /*
                         * Retry:
                         * Reuse the existing ShopSphere payment record
                         * but associate it with the new Razorpay order.
                         */
                        if (existingPayment != null) {

                                payment = existingPayment;

                                payment.setRazorpayOrderId(
                                                razorpayOrderId);

                                payment.setRazorpayPaymentId(null);

                                payment.setRazorpaySignature(null);

                                payment.setAmount(amount);

                                payment.setStatus(
                                                PaymentStatus.CREATED);

                                payment.setCreatedAt(
                                                LocalDateTime.now());

                        } else {

                                payment = Payment.builder()
                                                .order(shopSphereOrder)
                                                .razorpayOrderId(
                                                                razorpayOrderId)
                                                .amount(amount)
                                                .status(
                                                                PaymentStatus.CREATED)
                                                .createdAt(
                                                                LocalDateTime.now())
                                                .build();
                        }

                        paymentRepository.save(payment);

                        return PaymentOrderResponse.builder()
                                        .orderId(orderId)
                                        .razorpayOrderId(
                                                        razorpayOrderId)
                                        .amount(amount)
                                        .currency("INR")
                                        .keyId(razorpayKeyId)
                                        .build();

                } catch (Exception exception) {

                        throw new BadRequestException(
                                        "Unable to create Razorpay order");
                }
        }

        @Override
        public void verifyPayment(
                        Long userId,
                        PaymentVerificationRequest request) {

                /*
                 * Basic request validation.
                 */
                if (request == null
                                || request.getRazorpayOrderId() == null
                                || request.getRazorpayPaymentId() == null
                                || request.getRazorpaySignature() == null) {

                        throw new BadRequestException(
                                        "Invalid payment verification request");
                }

                /*
                 * Find the ShopSphere payment using the Razorpay
                 * order ID.
                 */
                Payment payment = paymentRepository
                                .findByRazorpayOrderId(
                                                request.getRazorpayOrderId())
                                .orElseThrow(() -> new BadRequestException(
                                                "Payment record not found"));

                /*
                 * Make sure this payment belongs to the logged-in user.
                 */
                if (!payment.getOrder()
                                .getUser()
                                .getId()
                                .equals(userId)) {

                        throw new BadRequestException(
                                        "You are not authorized to verify this payment");
                }

                /*
                 * Prevent duplicate verification.
                 */
                if (payment.getStatus() == PaymentStatus.SUCCESS) {

                        throw new BadRequestException(
                                        "Payment is already verified");
                }

                try {

                        /*
                         * Razorpay signature verification.
                         *
                         * Signature is generated using:
                         *
                         * HMAC SHA256(
                         * razorpay_order_id + "|" +
                         * razorpay_payment_id,
                         * key_secret
                         * )
                         */
                        JSONObject options = new JSONObject();

                        /*
                         * IMPORTANT:
                         * Use the Razorpay order ID stored in our database,
                         * rather than blindly trusting the frontend value.
                         */
                        options.put(
                                        "razorpay_order_id",
                                        payment.getRazorpayOrderId());

                        options.put(
                                        "razorpay_payment_id",
                                        request.getRazorpayPaymentId());

                        options.put(
                                        "razorpay_signature",
                                        request.getRazorpaySignature());

                        boolean signatureValid = Utils.verifyPaymentSignature(
                                        options,
                                        razorpayKeySecret);

                        if (!signatureValid) {

                                payment.setStatus(
                                                PaymentStatus.FAILED);

                                paymentRepository.save(payment);

                                throw new BadRequestException(
                                                "Payment signature verification failed");
                        }

                        /*
                         * Signature is valid.
                         * Save Razorpay payment information.
                         */
                        payment.setRazorpayPaymentId(
                                        request.getRazorpayPaymentId());

                        payment.setRazorpaySignature(
                                        request.getRazorpaySignature());

                        payment.setStatus(
                                        PaymentStatus.SUCCESS);

                        paymentRepository.save(payment);

                        /*
                         * Payment is successfully verified.
                         * Now confirm the ShopSphere order.
                         */
                        payment.getOrder()
                                        .setStatus(
                                                        OrderStatus.CONFIRMED);

                        orderRepository.save(
                                        payment.getOrder());

                } catch (BadRequestException exception) {

                        throw exception;

                } catch (Exception exception) {

                        throw new BadRequestException(
                                        "Payment verification failed");
                }
        }
}