package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.response.AdminDashboardStatsResponse;
import com.constructx.backend.admin.dto.response.AdminRevenueTrendPoint;
import com.constructx.backend.admin.dto.response.AdminProjectSummary;
import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.admin.dto.response.AdminSettingsResponse;
import com.constructx.backend.admin.service.AdminSettingsService;

import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final DisputeRepository disputeRepository;
    private final AdminSettingsService adminSettingsService;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        return getDashboardStats("month");
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats(String period) {
        List<Transaction> successfulLocks = transactionRepository
                .findByStatusAndTypeOrderByCreatedAtAsc(Transaction.Status.SUCCESS, Transaction.Type.LOCK);

        long gmv = successfulLocks.stream()
                .mapToLong(Transaction::getAmount)
                .sum();

        AdminSettingsResponse settings = adminSettingsService.getSettings();
        double platformRate = (settings.getPlatformFee() == null ? 0.0 : settings.getPlatformFee())
                + (settings.getManagementFee() == null ? 0.0 : settings.getManagementFee());
        long platformRevenue = Math.round(gmv * platformRate / 100.0);

        long totalEscrow = walletRepository.sumLockedAmount();
        long totalProjects = projectRepository.count();
        long activeProjects = countActiveProjects();

        long activeContractors = userRepository.countByRoleAndActive(User.Role.CONTRACTOR, true);

        long pendingProjects = projectRepository.countByApprovalStatus(Project.ApprovalStatus.PENDING);

        long pendingPartners = userRepository.countByRoleAndApprovalStatus(
                User.Role.CONTRACTOR,
                User.ApprovalStatus.PENDING
        );

        long openDisputes = disputeRepository.countByStatus(Dispute.Status.PENDING);

        List<AdminProjectSummary> recentProjects = projectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(5)
                .map(this::toSummary)
                .collect(Collectors.toList());

        String normalizedPeriod = normalizePeriod(period);

        return AdminDashboardStatsResponse.builder()
                .gmv(gmv)
                .platformRevenue(platformRevenue)
                .totalRevenue(platformRevenue)
                .totalEscrow(totalEscrow)
                .newProjectsCount(totalProjects)
                .activeProjectsCount(activeProjects)
                .activeContractors(activeContractors)
                .pendingProjects(pendingProjects)
                .pendingPartners(pendingPartners)
                .openDisputes(openDisputes)
                .myProjects(recentProjects)
                .revenuePeriod(normalizedPeriod)
                .revenueTrend(buildRevenueTrend(successfulLocks, platformRate, normalizedPeriod))
                .build();
    }

    private long countActiveProjects() {
        return projectRepository.findAll().stream()
                .filter(project -> project.getApprovalStatus() == Project.ApprovalStatus.APPROVED)
                .filter(project -> project.getStatus() == Project.Status.OPEN
                        || project.getStatus() == Project.Status.IN_PROGRESS)
                .count();
    }

    private String normalizePeriod(String period) {
        if (period == null) {
            return "month";
        }

        String normalized = period.trim().toLowerCase(Locale.ROOT);
        if ("quarter".equals(normalized) || "quarters".equals(normalized)) {
            return "quarter";
        }

        return "month";
    }

    private List<AdminRevenueTrendPoint> buildRevenueTrend(
            List<Transaction> transactions,
            double platformRate,
            String period
    ) {
        Map<String, RevenueAccumulator> buckets = new LinkedHashMap<>();

        if ("quarter".equals(period)) {
            for (int i = 3; i >= 0; i--) {
                YearMonth base = YearMonth.from(java.time.LocalDate.now()).minusMonths((long) i * 3L);
                int quarter = ((base.getMonthValue() - 1) / 3) + 1;
                String key = base.getYear() + "-Q" + quarter;
                buckets.put(key, new RevenueAccumulator(key));
            }
        } else {
            for (int i = 11; i >= 0; i--) {
                YearMonth ym = YearMonth.from(java.time.LocalDate.now()).minusMonths(i);
                String key = ym.getYear() + "-" + String.format("%02d", ym.getMonthValue());
                buckets.put(key, new RevenueAccumulator(ym.getMonthValue() + "/" + ym.getYear()));
            }
        }

        for (Transaction transaction : transactions) {
            if (transaction.getCreatedAt() == null) {
                continue;
            }

            String key = "quarter".equals(period)
                    ? toQuarterKey(transaction.getCreatedAt().toLocalDate())
                    : toMonthKey(transaction.getCreatedAt().toLocalDate());

            RevenueAccumulator accumulator = buckets.get(key);
            if (accumulator == null) {
                continue;
            }

            accumulator.gmv += transaction.getAmount();
            accumulator.transactionCount += 1;
        }

        List<AdminRevenueTrendPoint> trend = new ArrayList<>();
        for (RevenueAccumulator accumulator : buckets.values()) {
            long platformRevenue = Math.round(accumulator.gmv * platformRate / 100.0);
            trend.add(AdminRevenueTrendPoint.builder()
                    .label(accumulator.label)
                    .gmv(accumulator.gmv)
                    .platformRevenue(platformRevenue)
                    .transactionCount(accumulator.transactionCount)
                    .build());
        }

        return trend;
    }

    private String toMonthKey(LocalDate date) {
        return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
    }

    private String toQuarterKey(LocalDate date) {
        int quarter = ((date.getMonthValue() - 1) / 3) + 1;
        return date.getYear() + "-Q" + quarter;
    }

    private AdminProjectSummary toSummary(Project project) {
        return AdminProjectSummary.builder()
                .id(project.getId())
                .name(project.getName())
                .status(project.getStatus() == null ? null : project.getStatus().name())
                .approvalStatus(project.getApprovalStatus() == null
                        ? Project.ApprovalStatus.PENDING.name()
                        : project.getApprovalStatus().name())
                .category(project.getCategory())
                .area(project.getArea())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .customerName(project.getUser().getFullName())
                .createdAt(project.getCreatedAt())
                .build();
    }

    private static class RevenueAccumulator {
        private final String label;
        private long gmv;
        private long transactionCount;

        private RevenueAccumulator(String label) {
            this.label = label;
        }
    }
}
