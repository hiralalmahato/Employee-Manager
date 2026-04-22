package com.ems.service;

import java.util.List;

import com.ems.dto.DepartmentRequest;
import com.ems.model.Department;

public interface DepartmentService {
	Department createDepartment(DepartmentRequest request);
	List<Department> getDepartments();
}
