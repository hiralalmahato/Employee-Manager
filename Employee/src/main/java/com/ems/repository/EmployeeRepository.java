package com.ems.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ems.model.Employee;

public interface EmployeeRepository extends MongoRepository<Employee, String> {
	List<Employee> findByDepartmentId(String departmentId);
	Optional<Employee> findByEmail(String email);
	List<Employee> findByFullNameContainingIgnoreCaseOrEmployeeCodeContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String code, String email);
	boolean existsByEmail(String email);
}
