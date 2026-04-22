package com.ems.dto;

import java.time.LocalDate;

import com.ems.model.AttendanceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceRequest {
	@NotBlank
	private String employeeId;
	@NotNull
	private LocalDate date;
	@NotNull
	private AttendanceStatus status;
	private String checkInTime;
	private String checkOutTime;
	private String remarks;
}
