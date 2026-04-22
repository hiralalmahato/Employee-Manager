package com.ems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeaveActionRequest {
	@NotBlank
	private String approvedBy;
	private String remarks;
}
