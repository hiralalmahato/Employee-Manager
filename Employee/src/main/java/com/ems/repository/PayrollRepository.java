package com.ems.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.ems.model.PayrollRecord;

public interface PayrollRepository extends MongoRepository<PayrollRecord, String> {
	List<PayrollRecord> findByEmployeeId(String employeeId);
	List<PayrollRecord> findByMonth(String month);
}
