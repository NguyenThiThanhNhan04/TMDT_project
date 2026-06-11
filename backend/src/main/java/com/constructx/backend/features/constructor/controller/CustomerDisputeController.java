package com.constructx.backend.features.constructor.controller;

import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.features.constructor.entity.ContractJob;
import com.constructx.backend.features.constructor.repository.ContractJobRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class CustomerDisputeController {

    private final DisputeRepository disputeRepository;
    private final ContractJobRepository jobRepository;
    private final UserRepository userRepository;

    @PostMapping("/job/{jobId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> openDispute(
            @PathVariable Long jobId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ContractJob job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            if (!job.getCustomer().getId().equals(user.getId())) {
                throw new RuntimeException("Only customer can open a dispute");
            }
            if (job.getStatus() == ContractJob.Status.DISPUTED) {
                throw new RuntimeException("Dự án đã trong trạng thái tranh chấp");
            }

            // Chuyển trạng thái hợp đồng sang DISPUTED
            job.setStatus(ContractJob.Status.DISPUTED);
            jobRepository.save(job);

            // Tạo dispute dùng Entity của admin
            Dispute dispute = Dispute.builder()
                    .contractJob(job)
                    .project(job.getProject())
                    .customer(job.getCustomer())
                    .contractor(job.getContractor())
                    .reason(payload.get("reason"))
                    .amount(job.getAgreedPrice())
                    .build();

            dispute = disputeRepository.save(dispute);

            return ResponseEntity.ok(ApiResponse.ok(Map.of(
                    "id", dispute.getId(),
                    "status", dispute.getStatus().name(),
                    "message", "Đã gửi khiếu nại thành công. Admin sẽ xử lý sớm nhất."
            )));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
