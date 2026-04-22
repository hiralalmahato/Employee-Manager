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
@Document(collection = "leaves")
public class LeaveRequest {

	@Id
	private String id;
	private String employeeId;
	private String employeeName;
	private LocalDate fromDate;
	private LocalDate toDate;
	private String reason;
	private LeaveStatus status;
	private String approvedBy;
	private String remarks;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
