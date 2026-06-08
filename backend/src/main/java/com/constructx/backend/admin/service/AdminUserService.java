package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.request.AdminUserPasswordResetRequest;
import com.constructx.backend.admin.dto.request.AdminUserRoleUpdateRequest;
import com.constructx.backend.admin.dto.response.AdminUserResponse;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(String roleFilter, String statusFilter, String keyword) {
        return userRepository.findAll().stream()
                .filter(user -> matchesRole(user, roleFilter))
                .filter(user -> matchesStatus(user, statusFilter))
                .filter(user -> matchesKeyword(user, keyword))
                .sorted(Comparator.comparing(
                        User::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse toggleActive(Long id, boolean active) {
        User user = findUser(id);
        ensureMutableAdminAccount(user);
        user.setActive(active);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse resetPassword(Long id, AdminUserPasswordResetRequest request) {
        if (request == null || request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        User user = findUser(id);
        ensureMutableAdminAccount(user);
        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateRole(Long id, AdminUserRoleUpdateRequest request) {
        if (request == null || request.getRole() == null || request.getRole().isBlank()) {
            throw new RuntimeException("Vai trò không hợp lệ");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Vai trò không hợp lệ");
        }

        User user = findUser(id);
        ensureMutableAdminAccount(user);
        user.setRole(role);

        if (role == User.Role.CONTRACTOR) {
            user.setApprovalStatus(User.ApprovalStatus.PENDING);
            user.setActive(false);
        } else {
            user.setApprovalStatus(User.ApprovalStatus.APPROVED);
            user.setActive(true);
        }

        return toResponse(userRepository.save(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    private void ensureMutableAdminAccount(User user) {
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Không thể thay đổi tài khoản ADMIN");
        }
    }

    private boolean matchesRole(User user, String roleFilter) {
        if (roleFilter == null || roleFilter.isBlank() || roleFilter.equalsIgnoreCase("all")) {
            return true;
        }

        try {
            return user.getRole() == User.Role.valueOf(roleFilter.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

    private boolean matchesStatus(User user, String statusFilter) {
        if (statusFilter == null || statusFilter.isBlank() || statusFilter.equalsIgnoreCase("all")) {
            return true;
        }

        if ("active".equalsIgnoreCase(statusFilter)) {
            return user.isActive();
        }

        if ("inactive".equalsIgnoreCase(statusFilter)) {
            return !user.isActive();
        }

        try {
            return user.getApprovalStatus() == User.ApprovalStatus.valueOf(statusFilter.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

    private boolean matchesKeyword(User user, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }

        String term = keyword.trim().toLowerCase(Locale.ROOT);
        return contains(user.getFullName(), term)
                || contains(user.getEmail(), term)
                || contains(user.getPhoneNumber(), term)
                || contains(user.getAddress(), term);
    }

    private boolean contains(String source, String term) {
        return source != null && source.toLowerCase(Locale.ROOT).contains(term);
    }

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole() == null ? null : user.getRole().name())
                .active(user.isActive())
                .approvalStatus(user.getApprovalStatus() == null ? null : user.getApprovalStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
