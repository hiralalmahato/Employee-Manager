package com.ems.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

	@GetMapping
	public Map<String, String> root() {
		return Map.of(
			"status", "UP",
			"service", "employee-management-system",
			"message", "Use /api/auth/login to sign in"
		);
	}

	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of("status", "UP");
	}
}
