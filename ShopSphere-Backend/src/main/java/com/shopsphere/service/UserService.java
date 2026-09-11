package com.shopsphere.service;

import com.shopsphere.dto.LoginRequest;
import com.shopsphere.dto.LoginResponse;
import com.shopsphere.dto.RegisterRequest;

public interface UserService {

    void registerUser(RegisterRequest request);

    LoginResponse loginUser(LoginRequest request);
}