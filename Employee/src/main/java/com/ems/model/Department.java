package com.ems.model;

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
@Document(collection = "departments")
public class Department {

	@Id
	private String id;
	private String name;
	private String description;
	private String managerName;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
