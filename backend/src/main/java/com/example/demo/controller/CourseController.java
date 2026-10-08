package com.example.demo.controller;

import com.example.demo.model.Course;
import com.example.demo.repository.CourseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseRepository courseRepository;
    private final com.example.demo.service.ContentIngestionService contentIngestionService;

    public CourseController(CourseRepository courseRepository, com.example.demo.service.ContentIngestionService contentIngestionService) {
        this.courseRepository = courseRepository;
        this.contentIngestionService = contentIngestionService;
    }

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/ingest")
    public ResponseEntity<java.util.Map<String, String>> ingestContent(@RequestBody com.example.demo.dto.ContentIngestionRequest request) {
        try {
            String result = contentIngestionService.ingestAndGenerateContent(request);
            return ResponseEntity.ok(java.util.Map.of("message", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
