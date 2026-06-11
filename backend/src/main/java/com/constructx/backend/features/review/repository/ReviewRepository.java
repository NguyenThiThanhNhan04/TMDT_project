package com.constructx.backend.features.review.repository;

import com.constructx.backend.features.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRevieweeId(Long contractorId);
    boolean existsByContractJobIdAndReviewerId(Long jobId, Long reviewerId);
}
