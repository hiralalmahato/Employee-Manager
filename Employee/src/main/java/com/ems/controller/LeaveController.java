package com.ems.controller;

import java.util.List;
import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.LeaveActionRequest;
import com.ems.dto.LeaveRequestDto;
import com.ems.model.Employee;
import com.ems.model.LeaveRequest;
import com.ems.service.EmployeeService;
import com.ems.service.LeaveService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

	private final LeaveService leaveService;
	private final EmployeeService employeeService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
	public ResponseEntity<LeaveRequest> applyLeave(@Valid @RequestBody LeaveRequestDto request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.applyLeave(request));
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<List<LeaveRequest>> getAllLeaves() {
		return ResponseEntity.ok(leaveService.getAllLeaves());
	}

	@GetMapping("/me")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
	public ResponseEntity<List<LeaveRequest>> getMyLeaves(Principal principal) {
		Employee employee = employeeService.getEmployeeByEmail(principal.getName());
		return ResponseEntity.ok(leaveService.getLeavesByEmployeeId(employee.getId()));
	}

	@PatchMapping("/{id}/approve")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<LeaveRequest> approveLeave(@PathVariable String id, @Valid @RequestBody LeaveActionRequest request) {
		return ResponseEntity.ok(leaveService.approveLeave(id, request));
	}

	@PatchMapping("/{id}/reject")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable String id, @Valid @RequestBody LeaveActionRequest request) {
		return ResponseEntity.ok(leaveService.rejectLeave(id, request));
	}
}
