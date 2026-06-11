package com.constructx.backend.features.constructor.repository;

import com.constructx.backend.features.constructor.entity.ContractJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContractJobRepository extends JpaRepository<ContractJob, Long> {

    // tìm job của nhà thầu
    @Query("""
        SELECT cj
        FROM ContractJob cj
        JOIN FETCH cj.project p
        JOIN FETCH cj.customer c
        JOIN FETCH cj.contractor contractor
        WHERE contractor.email = :email
        ORDER BY cj.createdAt DESC
    """)
    List<ContractJob> findContractorJobs(
            @Param("email") String email
    );

    // Lấy các job đã hoàn thành của contractor
    @Query("""
    SELECT DISTINCT cj
    FROM ContractJob cj
    JOIN FETCH cj.project p
    LEFT JOIN FETCH p.imageUrls
    JOIN FETCH cj.customer c
    JOIN FETCH cj.contractor contractor
    WHERE contractor.email = :email
      AND cj.status = 'COMPLETED'
    ORDER BY cj.completedAt DESC
    """)
    List<ContractJob> findCompletedContractorJobs(
            @Param("email") String email
    );
//    Optional<ContractJob> findJobDetail(
//            @Param("jobId") Long jobId
    Optional<ContractJob> findById(Long id);

    Optional<ContractJob> findByProjectId(Long projectId);
}