package com.ems.controller;

import java.util.List;
import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.EmployeeRequest;
import com.ems.dto.EmployeeCreationResponse;
import com.ems.model.Employee;
import com.ems.service.EmployeeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

	private final EmployeeService employeeService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<List<Employee>> getAllEmployees() {
		return ResponseEntity.ok(employeeService.getAllEmployees());
	}

	@GetMapping("/me")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
	public ResponseEntity<Employee> getCurrentEmployee(Principal principal) {
		return ResponseEntity.ok(employeeService.getEmployeeByEmail(principal.getName()));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<Employee> getEmployee(@PathVariable String id) {
		return ResponseEntity.ok(employeeService.getEmployeeById(id));
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<EmployeeCreationResponse> createEmployee(@Valid @RequestBody EmployeeRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(request));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<Employee> updateEmployee(@PathVariable String id, @Valid @RequestBody EmployeeRequest request) {
		return ResponseEntity.ok(employeeService.updateEmployee(id, request));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<Void> deleteEmployee(@PathVariable String id) {
		employeeService.deleteEmployee(id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/search")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<List<Employee>> searchEmployees(@RequestParam String query) {
		return ResponseEntity.ok(employeeService.searchEmployees(query));
	}

	@GetMapping("/department/{departmentId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<List<Employee>> filterByDepartment(@PathVariable String departmentId) {
		return ResponseEntity.ok(employeeService.filterByDepartment(departmentId));
	}
}
