package com.realyt.backend.controller;

import com.realyt.backend.model.EditorApplication;
import com.realyt.backend.repository.EditorApplicationRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/editor-applications")
@CrossOrigin(origins = "*")
public class EditorApplicationController {

    private static final Logger logger = LoggerFactory.getLogger(EditorApplicationController.class);

    private final EditorApplicationRepository editorApplicationRepository;

    public EditorApplicationController(EditorApplicationRepository editorApplicationRepository) {
        this.editorApplicationRepository = editorApplicationRepository;
    }

    @PostMapping
    public ResponseEntity<EditorApplication> submitApplication(@Valid @RequestBody EditorApplication application) {
        if (application.getName() == null || application.getName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (application.getEmail() == null || application.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email address is required");
        }

        application.setStatus("NEW");
        application.setCreatedAt(Instant.now());

        EditorApplication saved = editorApplicationRepository.save(application);
        logger.info("New editor application submitted successfully: ID={}, email={}", saved.getId(), saved.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
