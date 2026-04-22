package com.ems.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
	@GetMapping("/")
	public Map<String, String> home() {
		return Map.of(
			"status", "UP",
			"service", "employee-management-system",
			"message", "Backend is running. Use /api/auth/login to sign in."
		);
	}
}