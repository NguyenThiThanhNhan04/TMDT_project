package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.dto.request.AdminUserPasswordResetRequest;
import com.constructx.backend.admin.dto.request.AdminUserRoleUpdateRequest;
import com.constructx.backend.admin.dto.response.AdminUserResponse;
import com.constructx.backend.admin.service.AdminUserService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers(
            @RequestParam(value = "role", defaultValue = "all") String role,
            @RequestParam(value = "status", defaultValue = "all") String status,
            @RequestParam(value = "q", required = false) String q
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getUsers(role, status, q)));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<AdminUserResponse>> toggleActive(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> payload
    ) {
        Object activeValue = payload.get("active");
        boolean active = activeValue instanceof Boolean
                ? (Boolean) activeValue
                : Boolean.parseBoolean(String.valueOf(activeValue));

        return ResponseEntity.ok(ApiResponse.ok(
                active ? "Mở khóa tài khoản thành công" : "Khóa tài khoản thành công",
                adminUserService.toggleActive(id, active)
        ));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<AdminUserResponse>> resetPassword(
            @PathVariable Long id,
            @RequestBody AdminUserPasswordResetRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đặt lại mật khẩu thành công",
                adminUserService.resetPassword(id, request)
        ));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(
            @PathVariable Long id,
            @RequestBody AdminUserRoleUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Cập nhật vai trò thành công",
                adminUserService.updateRole(id, request)
        ));
    }
}
