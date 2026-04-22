package com.ems.service;

import java.util.List;

import com.ems.dto.LeaveActionRequest;
import com.ems.dto.LeaveRequestDto;
import com.ems.model.LeaveRequest;

public interface LeaveService {
	LeaveRequest applyLeave(LeaveRequestDto request);
	LeaveRequest approveLeave(String id, LeaveActionRequest request);
	LeaveRequest rejectLeave(String id, LeaveActionRequest request);
	List<LeaveRequest> getAllLeaves();
	List<LeaveRequest> getLeavesByEmployeeId(String employeeId);
}
