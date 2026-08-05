package com.realyt.backend.controller;

import com.realyt.backend.model.Order;
import com.realyt.backend.model.OrderStatus;
import com.realyt.backend.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class CheckoutController {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutController.class);
    private final OrderRepository orderRepository;

    public CheckoutController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping("/{orderId}/checkout")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(@PathVariable Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        long amountPaise = order.getQuotedAmount() != null ? order.getQuotedAmount() : (long) (order.getPrice().doubleValue() * 100);
        String clientSecret = "pi_mock_" + UUID.randomUUID().toString().replace("-", "") + "_secret_test";

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("clientSecret", clientSecret);
        response.put("amountPaise", amountPaise);
        response.put("amountRupees", amountPaise / 100.0);
        response.put("currency", "INR");
        response.put("clientEmail", order.getClientEmail());
        response.put("occasionType", order.getOccasionType());
        response.put("bookingDate", order.getBookingDate());

        logger.info("Checkout session created for Order #{}. Amount: ₹{}", order.getId(), amountPaise / 100.0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPayment(@PathVariable Long orderId, @RequestBody(required = false) Map<String, Object> payload) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderOpt.get();
        order.setStatus(OrderStatus.CONFIRMED);
        Order saved = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "PAYMENT_RECEIVED");
        response.put("message", "Payment received successfully. Order confirmed!");
        response.put("orderId", saved.getId());
        response.put("orderStatus", saved.getStatus());

        logger.info("Payment confirmed for Order #{}. Status updated to CONFIRMED / PAYMENT_RECEIVED.", saved.getId());
        return ResponseEntity.ok(response);
    }
}
