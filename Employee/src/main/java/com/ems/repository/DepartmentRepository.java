package com.ems.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ems.model.Department;

public interface DepartmentRepository extends MongoRepository<Department, String> {
	boolean existsByNameIgnoreCase(String name);
}
