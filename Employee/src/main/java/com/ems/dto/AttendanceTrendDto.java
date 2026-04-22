package com.ems.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AttendanceTrendDto {
	private String name;
	private long present;
	private long absent;
}