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
@Document(collection = "payroll")
public class PayrollRecord {

	@Id
	private String id;
	private String employeeId;
	private String employeeName;
	private String month;
	private Double grossSalary;
	private Double deductions;
	private Double netSalary;
	private LocalDate paymentDate;
	private String payslipUrl;
	private LocalDateTime generatedAt;
	private LocalDateTime updatedAt;
}
