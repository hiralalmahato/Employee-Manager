package com.ems.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PayrollRequest {
	@NotBlank
	private String employeeId;
	@NotBlank
	private String month;
	@NotNull
	private Double grossSalary;
	private Double deductions;
}
