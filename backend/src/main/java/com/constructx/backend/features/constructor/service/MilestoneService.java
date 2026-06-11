package com.constructx.backend.features.constructor.service;

import com.constructx.backend.features.constructor.dto.request.CreateMilestoneUpdateRequest;
import com.constructx.backend.features.constructor.dto.MilestoneUpdateResponse;
import com.constructx.backend.features.constructor.entity.MilestoneUpdate;
import com.constructx.backend.features.constructor.entity.WorkMilestone;
import com.constructx.backend.features.constructor.repository.MilestoneUpdateRepository;
import com.constructx.backend.features.constructor.repository.WorkMilestoneRepository;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MilestoneService {

        private final WorkMilestoneRepository workMilestoneRepository;

        private final MilestoneUpdateRepository milestoneUpdateRepository;
        private final WalletRepository walletRepository;
        private final WalletCoreManager walletCoreManager;
        private final NotificationService notificationService;

        @Transactional
        public MilestoneUpdateResponse createUpdate(
                        Long milestoneId,
                        CreateMilestoneUpdateRequest request) {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                WorkMilestone milestone = workMilestoneRepository
                                .findDetailById(milestoneId)
                                .orElseThrow(() -> new RuntimeException("Milestone not found"));

                // chỉ contractor của job mới được update
                if (!milestone.getWorkPlan()
                                .getContractJob()
                                .getContractor()
                                .getEmail()
                                .equals(email)) {

                        throw new RuntimeException(
                                        "Bạn không có quyền cập nhật milestone này");
                }

                // plan phải approved
                if (milestone.getWorkPlan()
                                .getStatus() != com.constructx.backend.features.constructor.entity.WorkPlan.Status.APPROVED) {

                        throw new RuntimeException(
                                        "Kế hoạch chưa được phê duyệt");
                }

                // nếu milestone đang pending thì chuyển sang in_progress
                if (milestone.getStatus() == WorkMilestone.Status.PENDING) {

                        milestone.setStatus(
                                        WorkMilestone.Status.IN_PROGRESS);
                }

                MilestoneUpdate update = MilestoneUpdate.builder()
                                .milestone(milestone)
                                .title(request.getTitle())
                                .content(request.getContent())
                                .imageUrl(request.getImageUrl())
                                .build();

                milestoneUpdateRepository.save(update);

                return mapUpdateResponse(update);
        }

        private MilestoneUpdateResponse mapUpdateResponse(
                        MilestoneUpdate update) {

                return MilestoneUpdateResponse.builder()
                                .id(update.getId())
                                .milestoneId(update.getMilestone().getId())
                                .title(update.getTitle())
                                .content(update.getContent())
                                .imageUrl(update.getImageUrl())
                                .createdAt(update.getCreatedAt())
                                .build();
        }

        // chờ xác nhận
        @Transactional
        public void submitMilestone(Long milestoneId) {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                WorkMilestone milestone = workMilestoneRepository
                                .findDetailById(milestoneId)
                                .orElseThrow(() -> new RuntimeException("Milestone not found"));

                if (!milestone.getWorkPlan()
                                .getContractJob()
                                .getContractor()
                                .getEmail()
                                .equals(email)) {

                        throw new RuntimeException(
                                        "Bạn không có quyền");
                }

                if (milestone.getStatus() != WorkMilestone.Status.IN_PROGRESS) {

                        throw new RuntimeException(
                                        "Milestone chưa thi công");
                }

                milestone.setStatus(
                                WorkMilestone.Status.WAITING_CONFIRMATION);

                User customer = milestone.getWorkPlan().getContractJob().getCustomer();
                notificationService.createNotification(
                        customer, 
                        Notification.NotifType.SYSTEM, 
                        "Nhà thầu " + milestone.getWorkPlan().getContractJob().getContractor().getFullName() + " vừa yêu cầu nghiệm thu cột mốc: " + milestone.getTitle() + ". Vui lòng vào xem Nhật ký thi công và xác nhận giải ngân."
                );
        }

        @Transactional
        public void confirmMilestone(Long milestoneId) {

                String email = SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getName();

                WorkMilestone milestone = workMilestoneRepository
                                .findDetailById(milestoneId)
                                .orElseThrow(() -> new RuntimeException("Milestone not found"));

                String customerEmail = milestone.getWorkPlan()
                                .getContractJob()
                                .getCustomer()
                                .getEmail();

                if (!customerEmail.equals(email)) {

                        throw new RuntimeException(
                                        "Bạn không có quyền");
                }

                if (milestone.getStatus() != WorkMilestone.Status.WAITING_CONFIRMATION) {

                        throw new RuntimeException(
                                        "Milestone chưa gửi xác nhận");
                }

                milestone.setStatus(
                                WorkMilestone.Status.COMPLETED);

                Long customerId = milestone.getWorkPlan().getContractJob().getCustomer().getId();
                Long contractorId = milestone.getWorkPlan().getContractJob().getContractor().getId();
                String jobPrefix = "JOB-" + milestone.getWorkPlan().getContractJob().getId();

                Wallet customerWallet = walletRepository.findByUserIdForUpdate(customerId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví khách hàng"));

                Wallet contractorWallet = walletRepository.findByUserIdForUpdate(contractorId)
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví nhà thầu"));

                // Giải ngân
                walletCoreManager.executeMilestonePayment(
                                customerWallet,
                                contractorWallet,
                                milestone.getAmount(),
                                0L, // platform fee = 0
                                jobPrefix + "-MS-" + milestone.getId(),
                                "Hoàn thành cột mốc: " + milestone.getTitle());

                // Kiểm tra xem tất cả milestone đã hoàn thành chưa
                boolean allCompleted = milestone.getWorkPlan().getMilestones().stream()
                                .allMatch(m -> m.getStatus() == WorkMilestone.Status.COMPLETED);

                if (allCompleted) {
                        milestone.getWorkPlan().getContractJob().setStatus(com.constructx.backend.features.constructor.entity.ContractJob.Status.COMPLETED);
                        milestone.getWorkPlan().getContractJob().setCompletedAt(java.time.LocalDateTime.now());
                        milestone.getWorkPlan().getContractJob().getProject().setStatus(com.constructx.backend.features.project.entity.Project.Status.CLOSED);
                }
        }
}