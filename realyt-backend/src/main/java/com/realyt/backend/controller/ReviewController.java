package com.realyt.backend.controller;

import com.realyt.backend.model.Order;
import com.realyt.backend.model.Review;
import com.realyt.backend.repository.OrderRepository;
import com.realyt.backend.repository.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    public ReviewController(ReviewRepository reviewRepository, OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews(@RequestParam(required = false) Long editorId) {
        if (editorId != null) {
            return ResponseEntity.ok(reviewRepository.findByEditorIdOrderByCreatedAtDesc(editorId));
        }
        return ResponseEntity.ok(reviewRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Map<String, Object> body) {
        Review review = new Review();

        Long orderId = body.containsKey("orderId") ? Long.parseLong(body.get("orderId").toString()) : null;
        Long editorId = body.containsKey("editorId") ? Long.parseLong(body.get("editorId").toString()) : 1L;
        Integer rating = body.containsKey("rating") ? Integer.parseInt(body.get("rating").toString()) : 5;
        String comment = body.containsKey("comment") ? body.get("comment").toString() : "";
        String clientName = body.containsKey("clientName") ? body.get("clientName").toString() : "Client";

        if (orderId != null) {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                if (order.getEditor() != null) {
                    editorId = order.getEditor().getId();
                }
                review.setOccasionType(order.getOccasionType());
            }
        }

        review.setEditorId(editorId);
        review.setRating(rating);
        review.setComment(comment);
        review.setClientName(clientName);

        Review saved = reviewRepository.save(review);
        logger.info("New review saved into PostgreSQL reviews table for Editor #{}: {} stars", editorId, rating);
        return ResponseEntity.ok(saved);
    }
}
