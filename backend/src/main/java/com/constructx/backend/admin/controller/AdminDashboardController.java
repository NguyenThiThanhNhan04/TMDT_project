package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.dto.response.AdminDashboardStatsResponse;
import com.constructx.backend.admin.service.AdminDashboardService;

import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats(
            @RequestParam(value = "period", defaultValue = "month") String period
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminDashboardService.getDashboardStats(period)));
    }
}
