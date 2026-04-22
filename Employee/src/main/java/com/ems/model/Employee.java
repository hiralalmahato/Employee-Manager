package com.ems.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "employees")
public class Employee {

	@Id
	private String id;
	private String employeeCode;
	private String fullName;
	private String email;
	private String phone;
	private String departmentId;
	private String designation;
	private LocalDate joiningDate;
	private Double salary;
	private EmploymentStatus status;
	private Role role;
	private String profileImageUrl;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
