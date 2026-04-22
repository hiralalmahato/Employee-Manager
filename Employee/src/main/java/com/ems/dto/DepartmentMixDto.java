package com.ems.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepartmentMixDto {
	private String name;
	private long value;
}