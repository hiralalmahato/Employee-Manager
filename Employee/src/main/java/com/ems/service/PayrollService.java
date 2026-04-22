package com.ems.service;

import java.util.List;

import com.ems.dto.PayrollRequest;
import com.ems.model.PayrollRecord;

public interface PayrollService {
	PayrollRecord generatePayroll(PayrollRequest request);
	List<PayrollRecord> getPayrollRecords();
}
