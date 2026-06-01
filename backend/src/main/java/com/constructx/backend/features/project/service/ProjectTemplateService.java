package com.constructx.backend.features.project.service;

import com.constructx.backend.features.project.entity.ProjectTemplate;
import com.constructx.backend.features.project.repository.ProjectTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectTemplateService {

    private final ProjectTemplateRepository projectTemplateRepository;

    public List<ProjectTemplate> getAllTemplates() {
        return projectTemplateRepository.findAll();
    }
}
