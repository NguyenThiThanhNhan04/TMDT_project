package com.constructx.backend.features.review.service;

import com.constructx.backend.features.constructor.entity.ContractJob;
import com.constructx.backend.features.constructor.repository.ContractJobRepository;
import com.constructx.backend.features.review.dto.ReviewRequest;
import com.constructx.backend.features.review.dto.ReviewResponse;
import com.constructx.backend.features.review.entity.Review;
import com.constructx.backend.features.review.repository.ReviewRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ContractJobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, String username) {
        User user = userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found"));
        ContractJob job = jobRepository.findById(request.getJobId()).orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getCustomer().getId().equals(user.getId())) {
            throw new RuntimeException("Only customer can review");
        }
        if (job.getStatus() != ContractJob.Status.COMPLETED) {
            throw new RuntimeException("You can only review a completed job");
        }
        if (reviewRepository.existsByContractJobIdAndReviewerId(job.getId(), user.getId())) {
            throw new RuntimeException("You have already reviewed this job");
        }

        Review review = Review.builder()
                .contractJob(job)
                .reviewer(user)
                .reviewee(job.getContractor())
                .rating(request.getRating())
                .comment(request.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    public List<ReviewResponse> getContractorReviews(Long contractorId) {
        return reviewRepository.findByRevieweeId(contractorId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .jobId(review.getContractJob().getId())
                .reviewerName(review.getReviewer().getFullName())
                .reviewerAvatar(review.getReviewer().getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
