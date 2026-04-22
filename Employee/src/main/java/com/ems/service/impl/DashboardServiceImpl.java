package com.ems.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.ems.dto.AttendanceTrendDto;
import com.ems.dto.DepartmentMixDto;
import com.ems.dto.DashboardOverviewDto;
import com.ems.dto.LeaveTrendDto;
import com.ems.dto.RecentActivityDto;
import com.ems.model.Attendance;
import com.ems.model.AttendanceStatus;
import com.ems.model.Department;
import com.ems.model.Employee;
import com.ems.model.LeaveRequest;
import com.ems.model.PayrollRecord;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRepository;
import com.ems.repository.PayrollRepository;
import com.ems.service.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

	private final EmployeeRepository employeeRepository;
	private final AttendanceRepository attendanceRepository;
	private final LeaveRepository leaveRepository;
	private final DepartmentRepository departmentRepository;
	private final PayrollRepository payrollRepository;

	@Override
	public DashboardOverviewDto getOverview() {
		LocalDate today = LocalDate.now();
		LocalDate startOfTrend = today.minusDays(6);
		DateTimeFormatter dayLabelFormatter = DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH);
		DateTimeFormatter monthLabelFormatter = DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH);
		Map<String, Long> attendanceByStatus = new HashMap<>();
		List<AttendanceTrendDto> attendanceTrend = new ArrayList<>();
		Map<LocalDate, Long> leavesByMonth = new LinkedHashMap<>();
		List<LeaveTrendDto> leaveTrend = new ArrayList<>();
		List<DepartmentMixDto> departmentMix = new ArrayList<>();
		List<RecentActivityDto> recentActivities = new ArrayList<>();

		for (AttendanceStatus status : AttendanceStatus.values()) {
			attendanceByStatus.put(status.name(), attendanceRepository.countByDateAndStatus(today, status));
		}

		for (Department department : departmentRepository.findAll()) {
			departmentMix.add(DepartmentMixDto.builder()
				.name(department.getName())
				.value(employeeRepository.findByDepartmentId(department.getId()).size())
				.build());
		}

		for (LocalDate currentDate = startOfTrend; !currentDate.isAfter(today); currentDate = currentDate.plusDays(1)) {
			attendanceTrend.add(AttendanceTrendDto.builder()
				.name(dayLabelFormatter.format(currentDate))
				.present(attendanceRepository.countByDateAndStatus(currentDate, AttendanceStatus.PRESENT))
				.absent(attendanceRepository.countByDateAndStatus(currentDate, AttendanceStatus.ABSENT))
				.build());
		}

		for (int monthOffset = 5; monthOffset >= 0; monthOffset--) {
			LocalDate monthStart = today.withDayOfMonth(1).minusMonths(monthOffset);
			leavesByMonth.put(monthStart, 0L);
		}

		for (LeaveRequest leave : leaveRepository.findAll()) {
			LocalDate createdDate = leave.getCreatedAt() != null ? leave.getCreatedAt().toLocalDate() : leave.getFromDate();
			if (createdDate == null) {
				continue;
			}

			LocalDate monthStart = createdDate.withDayOfMonth(1);
			if (leavesByMonth.containsKey(monthStart)) {
				leavesByMonth.put(monthStart, leavesByMonth.get(monthStart) + 1);
			}
		}

		for (Map.Entry<LocalDate, Long> entry : leavesByMonth.entrySet()) {
			leaveTrend.add(LeaveTrendDto.builder()
				.month(monthLabelFormatter.format(entry.getKey()))
				.leaves(entry.getValue())
				.build());
		}

		recentActivities.addAll(
			employeeRepository.findAll().stream()
				.map(employee -> RecentActivityDto.builder()
					.category("Employee")
					.title(employee.getFullName())
					.details("Profile created for " + employee.getDesignation() + " in the " + departmentName(employee.getDepartmentId()) + " department")
					.timestamp(timestamp(employee.getUpdatedAt(), employee.getCreatedAt()))
					.build())
				.toList()
		);

		recentActivities.addAll(
			attendanceRepository.findAll().stream()
				.map(attendance -> RecentActivityDto.builder()
					.category("Attendance")
					.title(attendance.getStatus().name().replace('_', ' '))
					.details("Attendance marked for " + attendance.getDate() + " for employee " + attendance.getEmployeeId())
					.timestamp(timestamp(attendance.getUpdatedAt(), attendance.getCreatedAt()))
					.build())
				.toList()
		);

		recentActivities.addAll(
			leaveRepository.findAll().stream()
				.map(leave -> RecentActivityDto.builder()
					.category("Leave")
					.title(leave.getStatus().name().replace('_', ' '))
					.details(leave.getEmployeeName() + " requested leave from " + leave.getFromDate() + " to " + leave.getToDate())
					.timestamp(timestamp(leave.getUpdatedAt(), leave.getCreatedAt()))
					.build())
				.toList()
		);

		recentActivities.addAll(
			payrollRepository.findAll().stream()
				.map(payroll -> RecentActivityDto.builder()
					.category("Payroll")
					.title("Payroll generated")
					.details(payroll.getEmployeeName() + " salary processed for " + payroll.getMonth())
					.timestamp(timestamp(payroll.getUpdatedAt(), payroll.getGeneratedAt()))
					.build())
				.toList()
		);

		recentActivities = recentActivities.stream()
			.filter(activity -> activity.getTimestamp() != null)
			.sorted(Comparator.comparing(RecentActivityDto::getTimestamp).reversed())
			.limit(6)
			.collect(Collectors.toList());

		return DashboardOverviewDto.builder()
			.totalEmployees(employeeRepository.count())
			.presentToday(attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT))
			.absentToday(attendanceRepository.countByDateAndStatus(today, AttendanceStatus.ABSENT))
			.pendingLeaves(leaveRepository.countByStatus(com.ems.model.LeaveStatus.PENDING))
			.departments(departmentRepository.count())
			.payrollRecords(payrollRepository.count())
			.attendanceByStatus(attendanceByStatus)
			.attendanceTrend(attendanceTrend)
			.leaveTrend(leaveTrend)
			.departmentMix(departmentMix)
			.recentActivities(recentActivities)
			.build();
	}

	private String departmentName(String departmentId) {
		return departmentRepository.findById(departmentId)
			.map(Department::getName)
			.orElse("Unknown");
	}

	private LocalDateTime timestamp(LocalDateTime primary, LocalDateTime fallback) {
		return primary != null ? primary : fallback;
	}
}
