package com.ems.dto;

import com.ems.model.Employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCreationResponse {
	private Employee employee;
	private String generatedEmail;
	private String generatedPassword;
}