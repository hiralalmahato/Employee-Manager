package com.ems.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeaveRequestDto {
	@NotBlank
	private String employeeId;
	@NotBlank
	private String employeeName;
	@NotNull
	private LocalDate fromDate;
	@NotNull
	private LocalDate toDate;
	@NotBlank
	private String reason;
}
