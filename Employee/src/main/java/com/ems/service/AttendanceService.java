package com.ems.service;

import java.time.LocalDate;
import java.util.List;

import com.ems.dto.AttendanceRequest;
import com.ems.model.Attendance;

public interface AttendanceService {
	Attendance markAttendance(AttendanceRequest request);
	List<Attendance> getAttendanceByEmployee(String employeeId);
	List<Attendance> getAttendanceByDate(LocalDate date);
}
