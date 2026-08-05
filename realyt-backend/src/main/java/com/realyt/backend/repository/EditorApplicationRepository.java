package com.realyt.backend.repository;

import com.realyt.backend.model.EditorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EditorApplicationRepository extends JpaRepository<EditorApplication, Long> {
    List<EditorApplication> findByStatus(String status);
}
