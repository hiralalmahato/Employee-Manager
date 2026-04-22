package com.ems.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ems.dto.PayrollRequest;
import com.ems.exception.ResourceNotFoundException;
import com.ems.model.PayrollRecord;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PayrollRepository;
import com.ems.service.PayrollService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

	private final PayrollRepository payrollRepository;
	private final EmployeeRepository employeeRepository;

	@Override
	public PayrollRecord generatePayroll(PayrollRequest request) {
		var employee = employeeRepository.findById(request.getEmployeeId())
			.orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
		double deductions = request.getDeductions() == null ? 0.0 : request.getDeductions();
		double netSalary = request.getGrossSalary() - deductions;

		PayrollRecord record = PayrollRecord.builder()
			.employeeId(employee.getId())
			.employeeName(employee.getFullName())
			.month(request.getMonth())
			.grossSalary(request.getGrossSalary())
			.deductions(deductions)
			.netSalary(netSalary)
			.paymentDate(LocalDate.now())
			.generatedAt(LocalDateTime.now())
			.updatedAt(LocalDateTime.now())
			.build();
		return payrollRepository.save(record);
	}

	@Override
	public List<PayrollRecord> getPayrollRecords() {
		return payrollRepository.findAll();
	}
}
