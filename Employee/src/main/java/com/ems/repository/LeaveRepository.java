package com.ems.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ems.model.LeaveRequest;
import com.ems.model.LeaveStatus;

public interface LeaveRepository extends MongoRepository<LeaveRequest, String> {
	List<LeaveRequest> findByEmployeeId(String employeeId);
	List<LeaveRequest> findByEmployeeIdAndStatus(String employeeId, LeaveStatus status);
	List<LeaveRequest> findByStatus(LeaveStatus status);
	long countByStatus(LeaveStatus status);
}
