package com.shopsphere.service.impl;

import com.shopsphere.dto.LoginRequest;
import com.shopsphere.dto.LoginResponse;
import com.shopsphere.dto.RegisterRequest;
import com.shopsphere.entity.Role;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.shopsphere.security.JwtService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

        @Override
        public void registerUser(RegisterRequest request) {

                if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
                        throw new BadRequestException(
                                        "User with this email already exists");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail().toLowerCase())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER)
                                .createdAt(LocalDateTime.now())
                                .build();

                userRepository.save(user);
        }

        @Override
        public LoginResponse loginUser(LoginRequest request) {

                User user = userRepository
                                .findByEmailIgnoreCase(request.getEmail())
                                .orElseThrow(() -> new BadRequestException(
                                                "Invalid email or password"));

                if (!passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword())) {
                        throw new BadRequestException(
                                        "Invalid email or password");
                }

                String token = jwtService.generateToken(user.getEmail());

                return LoginResponse.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .token(token)
                                .build();
        }

}