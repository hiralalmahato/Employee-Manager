package com.ems.service;

import java.util.List;

import com.ems.dto.EmployeeCreationResponse;
import com.ems.dto.EmployeeRequest;
import com.ems.model.Employee;

public interface EmployeeService {
	List<Employee> getAllEmployees();
	Employee getEmployeeByEmail(String email);
	EmployeeCreationResponse createEmployee(EmployeeRequest request);
	Employee getEmployeeById(String id);
	Employee updateEmployee(String id, EmployeeRequest request);
	void deleteEmployee(String id);
	List<Employee> searchEmployees(String query);
	List<Employee> filterByDepartment(String departmentId);
}
