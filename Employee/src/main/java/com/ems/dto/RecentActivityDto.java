package com.ems.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecentActivityDto {
	private String category;
	private String title;
	private String details;
	private LocalDateTime timestamp;
}