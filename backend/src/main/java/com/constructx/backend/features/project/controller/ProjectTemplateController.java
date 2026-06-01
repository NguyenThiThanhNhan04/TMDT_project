package com.constructx.backend.features.project.controller;

import com.constructx.backend.features.project.entity.ProjectTemplate;
import com.constructx.backend.features.project.service.ProjectTemplateService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/project-templates")
@RequiredArgsConstructor
public class ProjectTemplateController {

    private final ProjectTemplateService projectTemplateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectTemplate>>> getAllTemplates() {
        return ResponseEntity.ok(ApiResponse.ok(projectTemplateService.getAllTemplates()));
    }
}
