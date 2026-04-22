package com.ems.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ems.dto.EmployeeCreationResponse;
import com.ems.dto.EmployeeRequest;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.Employee;
import com.ems.model.EmploymentStatus;
import com.ems.model.LeaveRequest;
import com.ems.model.LeaveStatus;
import com.ems.model.Role;
import com.ems.model.User;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRepository;
import com.ems.repository.UserRepository;
import com.ems.service.EmployeeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
	private static final String GENERATED_EMAIL_DOMAIN = "@gmail.com";
	private static final String DEFAULT_PASSWORD_SUFFIX = "032004";

	private final EmployeeRepository employeeRepository;
	private final DepartmentRepository departmentRepository;
	private final LeaveRepository leaveRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	public List<Employee> getAllEmployees() {
		List<Employee> employees = new ArrayList<>(employeeRepository.findAll());
		employees.forEach(this::applyCurrentLeaveStatus);
		return employees;
	}

	@Override
	public Employee getEmployeeByEmail(String email) {
		Employee employee = employeeRepository.findByEmail(email)
			.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
		return applyCurrentLeaveStatus(employee);
	}

	@Override
	public EmployeeCreationResponse createEmployee(EmployeeRequest request) {
		if (!departmentRepository.existsById(request.getDepartmentId())) {
			throw new ResourceNotFoundException("Department not found");
		}

		String generatedEmail = generateUniqueLoginEmail(request.getFullName());
		String rawPassword = generatePassword(request.getFullName());

		Employee employee = Employee.builder()
			.employeeCode("EMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
			.fullName(request.getFullName())
			.email(generatedEmail)
			.phone(request.getPhone())
			.departmentId(request.getDepartmentId())
			.designation(request.getDesignation())
			.joiningDate(request.getJoiningDate())
			.salary(request.getSalary())
			.status(request.getStatus() == null ? EmploymentStatus.ACTIVE : request.getStatus())
			.role(request.getRole() == null ? Role.EMPLOYEE : request.getRole())
			.profileImageUrl(request.getProfileImageUrl())
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();

		Employee savedEmployee = employeeRepository.save(employee);

		userRepository.save(User.builder()
			.fullName(savedEmployee.getFullName())
			.email(generatedEmail)
			.password(passwordEncoder.encode(rawPassword))
			.role(savedEmployee.getRole())
			.profileImageUrl(savedEmployee.getProfileImageUrl())
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build());

		return EmployeeCreationResponse.builder()
			.employee(savedEmployee)
			.generatedEmail(generatedEmail)
			.generatedPassword(rawPassword)
			.build();
	}

	@Override
	public Employee getEmployeeById(String id) {
		Employee employee = employeeRepository.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
		return applyCurrentLeaveStatus(employee);
	}

	@Override
	public Employee updateEmployee(String id, EmployeeRequest request) {
		Employee employee = getEmployeeById(id);
		String previousEmail = employee.getEmail();
		User linkedUser = userRepository.findByEmail(previousEmail).orElse(null);
		String updatedEmail = resolveEmail(request.getEmail(), previousEmail);
		employee.setFullName(request.getFullName());
		employee.setEmail(updatedEmail);
		employee.setPhone(request.getPhone());
		employee.setDepartmentId(request.getDepartmentId());
		employee.setDesignation(request.getDesignation());
		employee.setJoiningDate(request.getJoiningDate());
		employee.setSalary(request.getSalary());
		employee.setStatus(request.getStatus() == null ? employee.getStatus() : request.getStatus());
		employee.setRole(request.getRole() == null ? employee.getRole() : request.getRole());
		employee.setProfileImageUrl(request.getProfileImageUrl());
		employee.setUpdatedAt(LocalDateTime.now());
		Employee savedEmployee = employeeRepository.save(employee);

		if (linkedUser != null) {
			linkedUser.setFullName(savedEmployee.getFullName());
			linkedUser.setEmail(savedEmployee.getEmail());
			linkedUser.setRole(savedEmployee.getRole());
			linkedUser.setProfileImageUrl(savedEmployee.getProfileImageUrl());
			linkedUser.setUpdatedAt(LocalDateTime.now());
			userRepository.save(linkedUser);
		}

		return savedEmployee;
	}

	@Override
	public void deleteEmployee(String id) {
		Employee employee = employeeRepository.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

		if (employee.getEmail() != null) {
			userRepository.findByEmail(employee.getEmail()).ifPresent(userRepository::delete);
		}

		if (!employeeRepository.existsById(id)) {
			throw new ResourceNotFoundException("Employee not found");
		}
		employeeRepository.deleteById(id);
	}

	@Override
	public List<Employee> searchEmployees(String query) {
		List<Employee> employees = new ArrayList<>(employeeRepository.findByFullNameContainingIgnoreCaseOrEmployeeCodeContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query, query));
		employees.forEach(this::applyCurrentLeaveStatus);
		return employees;
	}

	@Override
	public List<Employee> filterByDepartment(String departmentId) {
		List<Employee> employees = new ArrayList<>(employeeRepository.findByDepartmentId(departmentId));
		employees.forEach(this::applyCurrentLeaveStatus);
		return employees;
	}

	private Employee applyCurrentLeaveStatus(Employee employee) {
		if (employee == null || employee.getId() == null) {
			return employee;
		}

		if (employee.getStatus() == EmploymentStatus.INACTIVE || employee.getStatus() == EmploymentStatus.PROBATION) {
			return employee;
		}

		boolean isOnApprovedLeaveToday = leaveRepository.findByEmployeeIdAndStatus(employee.getId(), LeaveStatus.APPROVED)
			.stream()
			.anyMatch(leave -> isDateWithinRange(LocalDate.now(), leave));

		employee.setStatus(isOnApprovedLeaveToday ? EmploymentStatus.ON_LEAVE : EmploymentStatus.ACTIVE);
		return employee;
	}

	private boolean isDateWithinRange(LocalDate date, LeaveRequest leave) {
		if (leave.getFromDate() == null || leave.getToDate() == null || date == null) {
			return false;
		}

		return !date.isBefore(leave.getFromDate()) && !date.isAfter(leave.getToDate());
	}

	private String generateUniqueLoginEmail(String fullName) {
		String baseName = sanitizeName(fullName);
		if (baseName.isBlank()) {
			baseName = "employee";
		}

		String candidate = baseName + "33" + GENERATED_EMAIL_DOMAIN;
		int suffix = 34;
		while (employeeRepository.existsByEmail(candidate) || userRepository.existsByEmail(candidate)) {
			candidate = baseName + suffix + GENERATED_EMAIL_DOMAIN;
			suffix++;
		}

		return candidate;
	}

	private String generatePassword(String fullName) {
		String baseName = sanitizeName(fullName);
		return baseName + "@" + DEFAULT_PASSWORD_SUFFIX;
	}

	private String resolveEmail(String requestEmail, String fallbackEmail) {
		if (requestEmail == null || requestEmail.isBlank()) {
			return fallbackEmail;
		}

		return requestEmail;
	}

	private String sanitizeName(String fullName) {
		if (fullName == null) {
			return "employee";
		}

		String sanitized = fullName.toLowerCase(Locale.ENGLISH)
			.replaceAll("[^a-z0-9]+", "")
			.trim();

		return sanitized.isBlank() ? "employee" : sanitized;
	}
}
