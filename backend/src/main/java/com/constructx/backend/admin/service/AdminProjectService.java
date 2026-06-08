package com.constructx.backend.admin.service;



import com.constructx.backend.admin.dto.request.AdminProjectReviewRequest;
import com.constructx.backend.admin.dto.response.AdminProjectResponse;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProjectService {

    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<AdminProjectResponse> getProjects(String view, String statusFilter) {
        return projectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(project -> matchesView(project, view, statusFilter))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminProjectResponse approveProject(Long id, AdminProjectReviewRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        String note = normalizeReason(request);

        project.setApprovalStatus(Project.ApprovalStatus.APPROVED);
        project.setStatus(Project.Status.OPEN);
        project.setAdminNote(note);
        project.setApprovedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        notificationService.createNotification(
                savedProject.getUser(),
                Notification.NotifType.SYSTEM,
                "Dự án #" + savedProject.getId()
                        + " - " + savedProject.getName()
                        + " đã được admin duyệt và hiển thị trên sàn."
        );
        return toResponse(savedProject);

        }

    @Transactional
    public AdminProjectResponse rejectProject(Long id, AdminProjectReviewRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        String reason = normalizeReason(request);

        project.setApprovalStatus(Project.ApprovalStatus.REJECTED);
        project.setStatus(Project.Status.CANCELLED);
        project.setAdminNote(reason);
        project.setApprovedAt(null);

        Project savedProject = projectRepository.save(project);

        notificationService.createNotification(
                savedProject.getUser(),
                Notification.NotifType.SYSTEM,
                "Dự án #" + savedProject.getId()
                        + " - " + savedProject.getName()
                        + " đã bị từ chối. Lý do: " + (reason == null ? "Vui lòng cập nhật lại thông tin dự án." : reason)
        );

        return toResponse(savedProject);
    }

    private boolean matchesView(Project project, String view, String statusFilter) {
        String normalizedView = view == null ? "review" : view.trim().toLowerCase(Locale.ROOT);

        if ("monitor".equals(normalizedView)) {
            return matchesProjectStatus(project, statusFilter);
        }

        return matchesApprovalStatus(project, statusFilter);
    }

    private boolean matchesApprovalStatus(Project project, String approvalStatus) {
        if (approvalStatus == null || approvalStatus.isBlank() || approvalStatus.equalsIgnoreCase("all")) {
            return true;
        }

        Project.ApprovalStatus current = project.getApprovalStatus() == null
                ? Project.ApprovalStatus.PENDING
                : project.getApprovalStatus();

        return current.name().equalsIgnoreCase(approvalStatus);
    }

    private boolean matchesProjectStatus(Project project, String statusFilter) {
        if (statusFilter == null || statusFilter.isBlank() || statusFilter.equalsIgnoreCase("all")) {
            return true;
        }

        Project.Status current = project.getStatus() == null
                ? Project.Status.DRAFT
                : project.getStatus();

        return current.name().equalsIgnoreCase(statusFilter);
    }

    private String normalizeReason(AdminProjectReviewRequest request) {
        if (request == null || request.getReason() == null || request.getReason().isBlank()) {
            return null;
        }

        return request.getReason().trim();
    }

    private AdminProjectResponse toResponse(Project project) {
        Project.ApprovalStatus approvalStatus = project.getApprovalStatus() == null
                ? Project.ApprovalStatus.PENDING
                : project.getApprovalStatus();

        return AdminProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .category(project.getCategory())
                .area(project.getArea())
                .style(project.getStyle())
                .address(project.getAddress())
                .description(project.getDescription())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .imageCount(project.getImageUrls() == null ? 0 : project.getImageUrls().size())
                .bidType(project.getBidType() == null ? null : project.getBidType().name())
                .status(project.getStatus() == null ? null : project.getStatus().name())
                .approvalStatus(approvalStatus.name())
                .adminNote(project.getAdminNote())
                .approvedAt(project.getApprovedAt())
                .createdAt(project.getCreatedAt())
                .customerId(project.getUser().getId())
                .customerName(project.getUser().getFullName())
                .customerEmail(project.getUser().getEmail())
                .build();
    }
}
