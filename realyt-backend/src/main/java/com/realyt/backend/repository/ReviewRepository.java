package com.realyt.backend.repository;

import com.realyt.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByEditorIdOrderByCreatedAtDesc(Long editorId);
}
