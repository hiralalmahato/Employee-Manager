package com.ems.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ems.dto.AttendanceRequest;
import com.ems.model.Attendance;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

	private final AttendanceRepository attendanceRepository;
	private final EmployeeRepository employeeRepository;

	@Override
	public Attendance markAttendance(AttendanceRequest request) {
		if (!employeeRepository.existsById(request.getEmployeeId())) {
			throw new IllegalArgumentException("Employee not found");
		}

		Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(request.getEmployeeId(), request.getDate());
		if (attendance == null) {
			attendance = Attendance.builder()
				.employeeId(request.getEmployeeId())
				.date(request.getDate())
				.createdAt(LocalDateTime.now())
				.build();
		}

		attendance.setStatus(request.getStatus());
		attendance.setCheckInTime(request.getCheckInTime());
		attendance.setCheckOutTime(request.getCheckOutTime());
		attendance.setRemarks(request.getRemarks());
		attendance.setUpdatedAt(LocalDateTime.now());
		return attendanceRepository.save(attendance);
	}

	@Override
	public List<Attendance> getAttendanceByEmployee(String employeeId) {
		return attendanceRepository.findByEmployeeId(employeeId);
	}

	@Override
	public List<Attendance> getAttendanceByDate(LocalDate date) {
		return attendanceRepository.findByDate(date);
	}
}
