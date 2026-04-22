package com.ems.dto;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardOverviewDto {
	private long totalEmployees;
	private long presentToday;
	private long absentToday;
	private long pendingLeaves;
	private long departments;
	private long payrollRecords;
	private Map<String, Long> attendanceByStatus;
	private List<AttendanceTrendDto> attendanceTrend;
	private List<LeaveTrendDto> leaveTrend;
	private List<DepartmentMixDto> departmentMix;
	private List<RecentActivityDto> recentActivities;
}
