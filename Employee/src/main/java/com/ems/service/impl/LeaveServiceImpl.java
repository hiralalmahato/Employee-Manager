package com.ems.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ems.dto.LeaveActionRequest;
import com.ems.dto.LeaveRequestDto;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.LeaveRequest;
import com.ems.model.LeaveStatus;
import com.ems.repository.LeaveRepository;
import com.ems.service.LeaveService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

	private final LeaveRepository leaveRepository;

	@Override
	public LeaveRequest applyLeave(LeaveRequestDto request) {
		LeaveRequest leave = LeaveRequest.builder()
			.employeeId(request.getEmployeeId())
			.employeeName(request.getEmployeeName())
			.fromDate(request.getFromDate())
			.toDate(request.getToDate())
			.reason(request.getReason())
			.status(LeaveStatus.PENDING)
			.createdAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();
		return leaveRepository.save(leave);
	}

	@Override
	public LeaveRequest approveLeave(String id, LeaveActionRequest request) {
		return updateStatus(id, LeaveStatus.APPROVED, request);
	}

	@Override
	public LeaveRequest rejectLeave(String id, LeaveActionRequest request) {
		return updateStatus(id, LeaveStatus.REJECTED, request);
	}

	@Override
	public List<LeaveRequest> getAllLeaves() {
		return leaveRepository.findAll();
	}

	@Override
	public List<LeaveRequest> getLeavesByEmployeeId(String employeeId) {
		return leaveRepository.findByEmployeeId(employeeId);
	}

	private LeaveRequest updateStatus(String id, LeaveStatus status, LeaveActionRequest request) {
		LeaveRequest leave = leaveRepository.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));
		leave.setStatus(status);
		leave.setApprovedBy(request.getApprovedBy());
		leave.setRemarks(request.getRemarks());
		leave.setUpdatedAt(LocalDateTime.now());
		return leaveRepository.save(leave);
	}
}
