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
@Document(collection = "attendance")
public class Attendance {

	@Id
	private String id;
	private String employeeId;
	private LocalDate date;
	private AttendanceStatus status;
	private String checkInTime;
	private String checkOutTime;
	private String remarks;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
