package com.ems.service;

import com.ems.dto.AuthRequest;
import com.ems.dto.AuthResponse;
import com.ems.dto.RegisterRequest;

public interface AuthService {
	AuthResponse register(RegisterRequest request);
	AuthResponse login(AuthRequest request);
}
