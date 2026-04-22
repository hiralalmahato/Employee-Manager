package com.ems.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ems.model.Attendance;
import com.ems.model.AttendanceStatus;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
	List<Attendance> findByEmployeeId(String employeeId);
	List<Attendance> findByDate(LocalDate date);
	Attendance findByEmployeeIdAndDate(String employeeId, LocalDate date);
	long countByDateAndStatus(LocalDate date, AttendanceStatus status);
}
