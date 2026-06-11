package com.constructx.backend.features.review.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long jobId;
    private String reviewerName;
    private String reviewerAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
