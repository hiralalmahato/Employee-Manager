package com.ems.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.AttendanceRequest;
import com.ems.model.Attendance;
import com.ems.service.AttendanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

	private final AttendanceService attendanceService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
	public ResponseEntity<Attendance> markAttendance(@Valid @RequestBody AttendanceRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.markAttendance(request));
	}

	@GetMapping("/employee/{employeeId}")
	@PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
	public ResponseEntity<List<Attendance>> getByEmployee(@PathVariable String employeeId) {
		return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(employeeId));
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
	public ResponseEntity<List<Attendance>> getByDate(@RequestParam LocalDate date) {
		return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
	}
}
