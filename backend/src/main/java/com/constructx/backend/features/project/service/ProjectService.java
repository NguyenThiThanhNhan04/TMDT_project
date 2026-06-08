package com.constructx.backend.features.project.service;

import com.constructx.backend.features.constructor.dto.BidDetailResponse;
import com.constructx.backend.features.constructor.dto.BidResponse;
import com.constructx.backend.features.constructor.dto.ProjectDetailResponse;
import com.constructx.backend.features.constructor.dto.ProjectResponse;
import com.constructx.backend.features.constructor.entity.Bid;
import com.constructx.backend.features.constructor.entity.BidDetail;
import com.constructx.backend.features.constructor.repository.BidRepository;
import com.constructx.backend.features.project.dto.ProjectRequest;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Project> getMyProjects() {
        User user = getCurrentUser();
        return projectRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Project> getAllOpenProjects() {
        return projectRepository.findByStatusOrderByCreatedAtDesc(Project.Status.OPEN)
                .stream()
                .filter(project -> project.getApprovalStatus() == Project.ApprovalStatus.APPROVED)
                .toList();
    }

    public Project getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        return project;
    }

    @Transactional
    public Project createProject(ProjectRequest request) {
        User user = getCurrentUser();

        Project.BidType bidType = Project.BidType.FIXED_PRICE;
        if ("DIRECT".equalsIgnoreCase(request.getBidType())) {
            bidType = Project.BidType.NEGOTIABLE;
        }

        Project project = Project.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .area(request.getArea())
                .style(request.getStyle())
                .address(request.getAddress())
                .description(request.getDescription())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .bidType(bidType)
                .status(Project.Status.DRAFT)
                .approvalStatus(Project.ApprovalStatus.PENDING)
                .imageUrls(request.getImageUrls())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProjectStatus(Long id, String status) {
        Project project = getProjectById(id);
        project.setStatus(Project.Status.valueOf(status.toUpperCase()));
        return projectRepository.save(project);
    }
    // hàm lấy chi tiết dự án và báo giá
    public ProjectDetailResponse getProjectDetail(Long projectId) {

        Project project = projectRepository.findDetailById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<BidResponse> bids = bidRepository.findProjectBids(projectId)
                .stream()
                .map(this::mapBidResponse)
                .toList();

        ProjectResponse projectResponse = ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .category(project.getCategory())
                .area(project.getArea())
                .style(project.getStyle())
                .address(project.getAddress())
                .description(project.getDescription())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .bidType(project.getBidType().name())
                .approvalStatus(project.getApprovalStatus() == null ? null : project.getApprovalStatus().name())
                .status(project.getStatus().name())
                .ownerName(project.getUser().getFullName())
                .ownerEmail(project.getUser().getEmail())
                .ownerPhone(project.getUser().getPhoneNumber())
                .createdAt(project.getCreatedAt())
                .imageUrls(project.getImageUrls())
                .build();

        return ProjectDetailResponse.builder()
                .project(projectResponse)
                .bids(bids)
                .build();
    }

    private BidResponse mapBidResponse(Bid bid) {

        List<BidDetailResponse> detailResponses = bid.getDetails()
                .stream()
                .map(this::mapBidDetailResponse)
                .toList();

        return BidResponse.builder()
                .id(bid.getId())
                .projectId(bid.getProject().getId())
                .contractorId(bid.getContractor().getId())
                .contractorName(bid.getContractor().getFullName())
                .contractorEmail(bid.getContractor().getEmail())
                .contractorPhone(bid.getContractor().getPhoneNumber())
                .totalPrice(bid.getTotalPrice())
                .estimatedDays(bid.getEstimatedDays())
                .message(bid.getMessage())
                .designImage(bid.getDesignImage())
                .status(bid.getStatus().name())
                .createdAt(bid.getCreatedAt())
                .details(detailResponses)
                .build();
    }

    private BidDetailResponse mapBidDetailResponse(BidDetail detail) {

        return BidDetailResponse.builder()
                .id(detail.getId())
                .itemName(detail.getItemName())
                .unit(detail.getUnit())
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .totalPrice(detail.getTotalPrice())
                .description(detail.getDescription())
                .sampleImage(detail.getSampleImage())
                .build();
    }
}
