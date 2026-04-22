package com.ems.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaveTrendDto {
    private String month;
    private long leaves;
}