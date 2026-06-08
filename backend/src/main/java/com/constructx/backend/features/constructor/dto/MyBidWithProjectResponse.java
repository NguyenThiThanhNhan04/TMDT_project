package com.constructx.backend.features.constructor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MyBidWithProjectResponse {

    // ===== Thông tin báo giá =====
    private Long bidId;
    private Long totalPrice;
    private Integer estimatedDays;
    private String message;
    private String designImage;
    private String bidStatus;
    private LocalDateTime bidCreatedAt;
    private List<BidDetailResponse> details;

    // ===== Thông tin dự án =====
    private Long projectId;
    private String projectName;
    private String category;
    private Double area;
    private String style;
    private String address;
    private String description;
    private Long budgetMin;
    private Long budgetMax;
    private String bidType;
    private String projectStatus;
    private List<String> imageUrls;
    private String ownerName;
    private String ownerPhone;
    private LocalDateTime projectCreatedAt;
}
