package com.shopsphere.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrderResponse {

    private Long orderId;

    private String razorpayOrderId;

    private BigDecimal amount;

    private String currency;

    private String keyId;
}