package com.ems.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ems.model.Attendance;
import com.ems.model.AttendanceStatus;
import com.ems.model.Department;
import com.ems.model.Employee;
import com.ems.model.EmploymentStatus;
import com.ems.model.LeaveRequest;
import com.ems.model.LeaveStatus;
import com.ems.model.Role;
import com.ems.model.User;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRepository;
import com.ems.repository.UserRepository;

@Configuration
public class DataSeeder {

	private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

	@Bean
	CommandLineRunner seedData(
		UserRepository userRepository,
		DepartmentRepository departmentRepository,
		EmployeeRepository employeeRepository,
		AttendanceRepository attendanceRepository,
		LeaveRepository leaveRepository,
		PasswordEncoder passwordEncoder
	) {
		return args -> {
			try {
				if (userRepository.count() == 0) {
					userRepository.saveAll(List.of(
						User.builder().fullName("System Admin").email("admin@ems.com").password(passwordEncoder.encode("Password@123")).role(Role.ADMIN).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
						User.builder().fullName("HR Manager").email("hr@ems.com").password(passwordEncoder.encode("Password@123")).role(Role.HR).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
						User.builder().fullName("Demo Employee").email("employee@ems.com").password(passwordEncoder.encode("Password@123")).role(Role.EMPLOYEE).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()
					));
				}

				Department engineering = departmentRepository.findAll().stream()
					.filter(department -> "Engineering".equalsIgnoreCase(department.getName()))
					.findFirst()
					.orElse(null);

				Department hr = departmentRepository.findAll().stream()
					.filter(department -> "Human Resources".equalsIgnoreCase(department.getName()))
					.findFirst()
					.orElse(null);

				Department operations = departmentRepository.findAll().stream()
					.filter(department -> "Operations".equalsIgnoreCase(department.getName()))
					.findFirst()
					.orElse(null);

				if (departmentRepository.count() == 0) {
					engineering = departmentRepository.save(Department.builder().name("Engineering").description("Builds core product features").managerName("HR Manager").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
					hr = departmentRepository.save(Department.builder().name("Human Resources").description("Handles hiring, policies, and employee support").managerName("System Admin").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
					operations = departmentRepository.save(Department.builder().name("Operations").description("Keeps the business running smoothly").managerName("System Admin").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
				}

				if (employeeRepository.findByEmail("employee@ems.com").isEmpty() && engineering != null) {
					employeeRepository.save(Employee.builder().employeeCode("EMP-1000").fullName("Demo Employee").email("employee@ems.com").phone("9876543213").departmentId(engineering.getId()).designation("Associate Developer").joiningDate(LocalDate.now().minusYears(1)).salary(50000.0).status(EmploymentStatus.ACTIVE).role(Role.EMPLOYEE).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
				}

				if (employeeRepository.count() == 0 && engineering != null && hr != null && operations != null) {
					employeeRepository.saveAll(List.of(
						Employee.builder().employeeCode("EMP-1001").fullName("Ananya Sharma").email("ananya@ems.com").phone("9876543210").departmentId(hr.getId()).designation("HR Manager").joiningDate(LocalDate.now().minusYears(3)).salary(85000.0).status(EmploymentStatus.ACTIVE).role(Role.HR).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
						Employee.builder().employeeCode("EMP-1002").fullName("John Mathew").email("john@ems.com").phone("9876543211").departmentId(engineering.getId()).designation("Frontend Developer").joiningDate(LocalDate.now().minusYears(2)).salary(76000.0).status(EmploymentStatus.ON_LEAVE).role(Role.EMPLOYEE).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build(),
						Employee.builder().employeeCode("EMP-1003").fullName("Riya Singh").email("riya@ems.com").phone("9876543212").departmentId(operations.getId()).designation("Operations Executive").joiningDate(LocalDate.now().minusYears(1)).salary(52000.0).status(EmploymentStatus.ACTIVE).role(Role.EMPLOYEE).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()
					));
				}

				if (attendanceRepository.count() == 0) {
					List<Employee> attendanceEmployees = employeeRepository.findAll();
					List<Attendance> attendanceSeed = new ArrayList<>();
					LocalDate startDate = LocalDate.now().minusDays(6);

					for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
						LocalDate currentDate = startDate.plusDays(dayOffset);
						for (int employeeIndex = 0; employeeIndex < attendanceEmployees.size(); employeeIndex++) {
							Employee employee = attendanceEmployees.get(employeeIndex);
							AttendanceStatus status = ((dayOffset + employeeIndex) % 4 == 0)
								? AttendanceStatus.ABSENT
								: AttendanceStatus.PRESENT;

							attendanceSeed.add(Attendance.builder()
								.employeeId(employee.getId())
								.date(currentDate)
								.status(status)
								.checkInTime(status == AttendanceStatus.PRESENT ? "09:00 AM" : null)
								.checkOutTime(status == AttendanceStatus.PRESENT ? "06:00 PM" : null)
								.remarks("Demo attendance seed")
								.createdAt(LocalDateTime.now())
								.updatedAt(LocalDateTime.now())
								.build());
						}
					}

					attendanceRepository.saveAll(attendanceSeed);
				}

				if (leaveRepository.count() == 0) {
					List<Employee> leaveEmployees = employeeRepository.findAll();
					List<LeaveRequest> leaveSeed = new ArrayList<>();
					LocalDate currentMonthStart = LocalDate.now().withDayOfMonth(1);

					for (int monthOffset = 5; monthOffset >= 0; monthOffset--) {
						LocalDate monthStart = currentMonthStart.minusMonths(monthOffset);
						for (int employeeIndex = 0; employeeIndex < leaveEmployees.size(); employeeIndex++) {
							if ((monthOffset + employeeIndex) % 2 != 0) {
								continue;
							}

							Employee employee = leaveEmployees.get(employeeIndex);
							LocalDate fromDate = monthStart.plusDays(Math.min(7 + employeeIndex, monthStart.lengthOfMonth() - 1));
							leaveSeed.add(LeaveRequest.builder()
								.employeeId(employee.getId())
								.employeeName(employee.getFullName())
								.fromDate(fromDate)
								.toDate(fromDate.plusDays(1))
								.reason("Demo leave seed")
								.status((employeeIndex + monthOffset) % 3 == 0 ? LeaveStatus.APPROVED : LeaveStatus.PENDING)
								.approvedBy("System Admin")
								.remarks("Demo leave seed")
								.createdAt(LocalDateTime.now().minusMonths(monthOffset).plusDays(employeeIndex))
								.updatedAt(LocalDateTime.now().minusMonths(monthOffset).plusDays(employeeIndex))
								.build());
						}
					}

					leaveRepository.saveAll(leaveSeed);
				}
			} catch (DataAccessException exception) {
				log.warn("Skipping data seeding because MongoDB is unavailable: {}", exception.getMostSpecificCause() != null ? exception.getMostSpecificCause().getMessage() : exception.getMessage());
			}
		};
	}
}
