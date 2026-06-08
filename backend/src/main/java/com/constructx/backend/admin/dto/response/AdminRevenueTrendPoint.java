package com.constructx.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminRevenueTrendPoint {
    private String label;
    private long gmv;
    private long platformRevenue;
    private long transactionCount;
}
