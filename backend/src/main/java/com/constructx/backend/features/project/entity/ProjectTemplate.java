package com.constructx.backend.features.project.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long budgetMin;

    private Long budgetMax;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;
}
