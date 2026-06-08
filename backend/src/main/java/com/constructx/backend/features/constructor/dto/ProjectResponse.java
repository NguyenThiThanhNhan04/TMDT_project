package com.constructx.backend.features.constructor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProjectResponse {

    private Long id;

    private String name;

    private String category;

    private Double area;

    private String style;

    private String address;

    private String description;

    private Long budgetMin;

    private Long budgetMax;

    private String bidType;

    private String approvalStatus;

    private String status;

    private String ownerName;

    private String ownerEmail;

    private String ownerPhone;

    private LocalDateTime createdAt;

    private List<String> imageUrls;
}
