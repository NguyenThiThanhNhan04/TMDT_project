package com.constructx.backend.features.review.controller;

import com.constructx.backend.shared.dto.ApiResponse;
import com.constructx.backend.features.review.dto.ReviewRequest;
import com.constructx.backend.features.review.dto.ReviewResponse;
import com.constructx.backend.features.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @RequestBody ReviewRequest request,
            Principal principal) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.createReview(request, principal.getName())));
    }

    @GetMapping("/contractor/{contractorId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getContractorReviews(
            @PathVariable Long contractorId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getContractorReviews(contractorId)));
    }
}
