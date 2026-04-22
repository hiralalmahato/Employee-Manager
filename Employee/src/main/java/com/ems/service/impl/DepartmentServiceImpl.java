package com.ems.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ems.dto.DepartmentRequest;
import com.ems.exception.DuplicateResourceException;
import com.ems.model.Department;
import com.ems.repository.DepartmentRepository;
import com.ems.service.DepartmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

	private final DepartmentRepository departmentRepository;

	@Override
	public Department createDepartment(DepartmentRequest request) {
		if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
			throw new DuplicateResourceException("Department already exists");
		}

		Department department = Department.builder()
			.name(request.getName())
			.description(request.getDescription())
			.managerName(request.getManagerName())
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();

		return departmentRepository.save(department);
	}

	@Override
	public List<Department> getDepartments() {
		return departmentRepository.findAll();
	}
}
