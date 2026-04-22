package com.ems.dto;

import java.time.LocalDate;

import com.ems.model.EmploymentStatus;
import com.ems.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmployeeRequest {
	@NotBlank
	private String fullName;
	private String email;
	private String phone;
	@NotBlank
	private String departmentId;
	@NotBlank
	private String designation;
	private LocalDate joiningDate;
	@NotNull
	private Double salary;
	private EmploymentStatus status;
	private Role role;
	private String profileImageUrl;
}
