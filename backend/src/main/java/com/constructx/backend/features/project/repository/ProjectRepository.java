package com.constructx.backend.features.project.repository;

import com.constructx.backend.features.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Project> findByStatusOrderByCreatedAtDesc(Project.Status status);
    List<Project> findAllByOrderByCreatedAtDesc();

    // thêm
    long countByApprovalStatus(Project.ApprovalStatus approvalStatus);

    @Query("""
        SELECT p
        FROM Project p
        JOIN FETCH p.user
        WHERE p.id = :projectId
    """)
    Optional<Project> findDetailById(@Param("projectId") Long projectId);
}
