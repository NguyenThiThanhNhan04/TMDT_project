package com.constructx.backend.features.review.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long jobId;
    private Integer rating;
    private String comment;
}
