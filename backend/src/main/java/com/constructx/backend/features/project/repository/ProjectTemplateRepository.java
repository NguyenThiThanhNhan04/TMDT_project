package com.constructx.backend.features.project.repository;

import com.constructx.backend.features.project.entity.ProjectTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectTemplateRepository extends JpaRepository<ProjectTemplate, Long> {
}
