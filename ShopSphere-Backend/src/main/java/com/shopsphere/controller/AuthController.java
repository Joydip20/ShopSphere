package com.shopsphere.controller;

import com.shopsphere.dto.ApiResponse;
import com.shopsphere.dto.LoginRequest;
import com.shopsphere.dto.LoginResponse;
import com.shopsphere.dto.RegisterRequest;
import com.shopsphere.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final UserService userService;

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<Void>> register(
                        @Valid @RequestBody RegisterRequest request) {

                userService.registerUser(request);

                ApiResponse<Void> response = ApiResponse.<Void>builder()
                                .success(true)
                                .message("User registered successfully")
                                .data(null)
                                .build();

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<LoginResponse>> login(
                        @Valid @RequestBody LoginRequest request) {

                LoginResponse loginResponse = userService.loginUser(request);

                ApiResponse<LoginResponse> response = ApiResponse.<LoginResponse>builder()
                                .success(true)
                                .message("Login successful")
                                .data(loginResponse)
                                .build();

                return ResponseEntity.ok(response);
        }

}