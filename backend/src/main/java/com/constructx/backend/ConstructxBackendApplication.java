package com.constructx.backend;

import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ConstructxBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConstructxBackendApplication.class, args);
    }

    @Bean
    public Hibernate6Module hibernate6Module() {
        return new Hibernate6Module();
    }

    @Bean
    public org.springframework.boot.CommandLineRunner initAdmin(
            UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByEmail("admin@constructx.com").ifPresentOrElse(
                    admin -> {
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        userRepository.save(admin);
                        System.out.println(
                                ">>> Updated existing ADMIN account password: admin@constructx.com / admin123");
                    },
                    () -> {
                        User admin = new User();
                        admin.setFullName("Admin Hệ Thống");
                        admin.setEmail("admin@constructx.com");
                        admin.setPassword(passwordEncoder.encode("admin123"));
                        admin.setRole(User.Role.ADMIN);
                        admin.setActive(true);
                        admin.setCreatedAt(java.time.LocalDateTime.now());
                        userRepository.save(admin);
                        System.out.println(">>> Created new default ADMIN account: admin@constructx.com / admin123");
                    });
        };
    }

    @Bean
    public org.springframework.boot.CommandLineRunner initProjectTemplates(
            com.constructx.backend.features.project.repository.ProjectTemplateRepository projectTemplateRepository) {
        return args -> {
            if (projectTemplateRepository.count() == 0) {
                java.util.List<com.constructx.backend.features.project.entity.ProjectTemplate> templates = java.util.List
                        .of(
                                com.constructx.backend.features.project.entity.ProjectTemplate.builder()
                                        .title("Đóng bàn làm việc gỗ tự nhiên")
                                        .description(
                                                "Cần tìm xưởng gia công 1 bàn làm việc cá nhân bằng gỗ sồi/cao su, kích thước 120x60cm, có 2 ngăn kéo. Thiết kế đơn giản, chắc chắn.")
                                        .budgetMin(800000L)
                                        .budgetMax(1500000L)
                                        .imageUrl(
                                                "https://images.pexels.com/photos/129731/pexels-photo-129731.jpeg?auto=compress&cs=tinysrgb&w=800")
                                        .build(),
                                com.constructx.backend.features.project.entity.ProjectTemplate.builder()
                                        .title("Bộ bàn ghế ăn gia đình 4 ghế")
                                        .description(
                                                "Tìm xưởng sản xuất 1 bộ bàn ăn mặt đá nhân tạo hoặc gỗ, kèm 4 ghế bọc nệm. Phong cách hiện đại, màu sắc trung tính.")
                                        .budgetMin(3000000L)
                                        .budgetMax(6000000L)
                                        .imageUrl(
                                                "https://images.pexels.com/photos/2082092/pexels-photo-2082092.jpeg?auto=compress&cs=tinysrgb&w=800")
                                        .build(),
                                com.constructx.backend.features.project.entity.ProjectTemplate.builder()
                                        .title("Tủ quần áo gỗ MDF chống ẩm")
                                        .description(
                                                "Cần đóng 1 tủ quần áo kịch trần, kích thước rộng 2m x cao 2m8. Vật liệu MDF phủ Melamine lõi xanh chống ẩm.")
                                        .budgetMin(4000000L)
                                        .budgetMax(8000000L)
                                        .imageUrl(
                                                "https://images.pexels.com/photos/6301168/pexels-photo-6301168.jpeg?auto=compress&cs=tinysrgb&w=800")
                                        .build());
                projectTemplateRepository.saveAll(templates);
                System.out.println(">>> Seeded 3 updated project templates (Lower price, better images).");
            }
        };
    }

    @Bean
    public org.springframework.boot.CommandLineRunner fixImageColumnSize(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE project_images MODIFY COLUMN image_url TEXT");
                System.out.println(">>> Forced project_images.image_url to TEXT!");
            } catch (Exception e) {
                System.out.println(">>> Note: Could not modify project_images column: " + e.getMessage());
            }
        };
    }
}
