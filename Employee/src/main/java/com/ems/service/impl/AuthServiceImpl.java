package com.ems.service.impl;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ems.dto.AuthRequest;
import com.ems.dto.AuthResponse;
import com.ems.dto.RegisterRequest;
import com.ems.exception.DuplicateResourceException;
import com.ems.model.User;
import com.ems.repository.UserRepository;
import com.ems.service.AuthService;
import com.ems.util.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	@Override
	public AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateResourceException("Email already exists");
		}

		User user = User.builder()
			.fullName(request.getFullName())
			.email(request.getEmail())
			.password(passwordEncoder.encode(request.getPassword()))
			.role(request.getRole())
			.profileImageUrl(request.getProfileImageUrl())
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();

		User savedUser = userRepository.save(user);
		return buildResponse(savedUser);
	}

	@Override
	public AuthResponse login(AuthRequest request) {
		authenticationManager.authenticate(
			new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
		);

		User user = userRepository.findByEmail(request.getEmail())
			.orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
		return buildResponse(user);
	}

	private AuthResponse buildResponse(User user) {
		return AuthResponse.builder()
			.token(jwtService.generateToken(user))
			.tokenType("Bearer")
			.userId(user.getId())
			.fullName(user.getFullName())
			.email(user.getEmail())
			.role(user.getRole())
			.build();
	}
}
