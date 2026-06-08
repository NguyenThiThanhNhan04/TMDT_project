package com.constructx.backend.admin.dto.request;

import lombok.Data;

@Data
public class AdminUserPasswordResetRequest {
    private String newPassword;
}
