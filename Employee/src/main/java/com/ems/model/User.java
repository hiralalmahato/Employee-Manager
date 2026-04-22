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
@Document(collection = "users")
public class User {

	@Id
	private String id;
	private String fullName;
	private String email;
	private String password;
	private Role role;
	private String profileImageUrl;
	@Builder.Default
	private Boolean enabled = Boolean.TRUE;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
