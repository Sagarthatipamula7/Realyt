package com.realyt.backend.controller;

import com.realyt.backend.model.Notification;
import com.realyt.backend.model.Order;
import com.realyt.backend.model.OrderStatus;
import com.realyt.backend.model.ReelPricing;
import com.realyt.backend.model.UserAccount;
import com.realyt.backend.model.UserRole;
import com.realyt.backend.repository.NotificationRepository;
import com.realyt.backend.repository.OrderRepository;
import com.realyt.backend.repository.ReelPricingRepository;
import com.realyt.backend.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class ClientOrderController {

    private static final Logger logger = LoggerFactory.getLogger(ClientOrderController.class);

    private final OrderRepository orderRepository;
    private final UserAccountRepository userAccountRepository;
    private final ReelPricingRepository reelPricingRepository;
    private final NotificationRepository notificationRepository;

    public ClientOrderController(OrderRepository orderRepository,
                                 UserAccountRepository userAccountRepository,
                                 ReelPricingRepository reelPricingRepository,
                                 NotificationRepository notificationRepository) {
        this.orderRepository = orderRepository;
        this.userAccountRepository = userAccountRepository;
        this.reelPricingRepository = reelPricingRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Order>> getMyOrders(@RequestParam(required = false) String email) {
        if (email != null && !email.isBlank()) {
            return ResponseEntity.ok(orderRepository.findByClientEmailOrderByCreatedAtDesc(email.trim().toLowerCase()));
        }
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/editor/assignments")
    public ResponseEntity<List<Order>> getEditorAssignments(@RequestParam(required = false) String email) {
        List<Order> all = orderRepository.findAllByOrderByCreatedAtDesc();
        if (email != null && !email.isBlank()) {
            String target = email.trim().toLowerCase();
            List<Order> filtered = all.stream()
                    .filter(o -> o.getEditor() != null && (target.equalsIgnoreCase(o.getEditor().getEmail()) || (o.getEditor().getFullName() != null && o.getEditor().getFullName().toLowerCase().contains(target))))
                    .toList();
            return ResponseEntity.ok(filtered);
        }
        List<Order> assigned = all.stream().filter(o -> o.getEditor() != null).toList();
        return ResponseEntity.ok(assigned);
    }

    @GetMapping("/editors-list")
    public ResponseEntity<List<Map<String, Object>>> getEditorsList() {
        List<UserAccount> editors = userAccountRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.EDITOR)
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (UserAccount ed : editors) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", ed.getId());
            map.put("name", ed.getFullName() + " (" + ed.getEmail() + ")");
            map.put("fullName", ed.getFullName());
            map.put("email", ed.getEmail());
            map.put("status", "Active & Available");
            map.put("rating", "4.9");
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = orderOpt.get();
        if (body != null && body.containsKey("status")) {
            String newStatusStr = body.get("status").toUpperCase();
            try {
                OrderStatus newStatus = OrderStatus.valueOf(newStatusStr);
                order.setStatus(newStatus);
            } catch (Exception e) {
                if ("COMPLETED".equalsIgnoreCase(newStatusStr) || "DELIVERED".equalsIgnoreCase(newStatusStr)) {
                    order.setStatus(OrderStatus.COMPLETED);
                } else if ("IN_PROGRESS".equalsIgnoreCase(newStatusStr)) {
                    order.setStatus(OrderStatus.IN_PROGRESS);
                }
            }
            orderRepository.save(order);
            logger.info("Order #{} status updated to {} in PostgreSQL database.", order.getId(), order.getStatus());
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Map<String, Object> body) {
        Order order = new Order();

        String email = (String) body.get("email");
        if (email == null) email = (String) body.get("clientEmail");
        if (email != null && !email.isBlank()) {
            String trimmedEmail = email.trim().toLowerCase();
            order.setClientEmail(trimmedEmail);
            Optional<UserAccount> userOpt = userAccountRepository.findByEmail(trimmedEmail);
            userOpt.ifPresent(order::setClient);
        }

        String phone = (String) body.get("phone");
        if (phone == null) phone = (String) body.get("clientPhone");
        if (phone != null && !phone.isBlank()) {
            order.setClientPhone(phone.trim());
        }

        order.setClientName((String) body.getOrDefault("name", body.getOrDefault("clientName", "Client")));
        order.setOccasionType((String) body.getOrDefault("occasion", body.getOrDefault("occasionType", "Celebration")));

        String dateStr = (String) body.get("bookingDate");
        if (dateStr != null && !dateStr.isBlank()) {
            order.setBookingDate(LocalDate.parse(dateStr));
        } else {
            order.setBookingDate(LocalDate.now().plusDays(7));
        }

        Object reelVal = body.get("reelCount");
        int reelCount = 1;
        if (reelVal instanceof Number) {
            reelCount = ((Number) reelVal).intValue();
        }
        order.setReelCount(reelCount);

        // Server-side Recalculation against ReelPricing table (in paise)
        long serverTotalPaise = 0L;
        Object reelsObj = body.get("reels");
        if (reelsObj instanceof Map) {
            Map<?, ?> reelsMap = (Map<?, ?>) reelsObj;
            for (Map.Entry<?, ?> entry : reelsMap.entrySet()) {
                String typeStr = String.valueOf(entry.getKey());
                Object countObj = entry.getValue();
                int qty = (countObj instanceof Number) ? ((Number) countObj).intValue() : 0;
                if (qty > 0) {
                    Optional<ReelPricing> pricingOpt = reelPricingRepository.findByReelTypeIgnoreCase(typeStr);
                    long unitPrice = pricingOpt.map(ReelPricing::getBasePrice).orElse(100000L); // Default ₹1,000 if type unlisted
                    serverTotalPaise += unitPrice * qty;
                }
            }
        }

        if (serverTotalPaise == 0L) {
            // Fallback default calculation: ₹1,200 per reel
            serverTotalPaise = 120000L * Math.max(1, reelCount);
        }

        order.setQuotedAmount(serverTotalPaise);
        order.setPrice(BigDecimal.valueOf(serverTotalPaise / 100.0));

        // Check for mismatch with frontend estimated total if sent
        Object frontendTotalObj = body.get("frontendTotalRupees");
        if (frontendTotalObj instanceof Number) {
            double frontendRupees = ((Number) frontendTotalObj).doubleValue();
            double serverRupees = serverTotalPaise / 100.0;
            if (Math.abs(frontendRupees - serverRupees) > 1.0) {
                logger.warn("Pricing Mismatch Flagged! Order for {}: Frontend Total = ₹{}, Server Recalculated = ₹{}",
                        order.getClientEmail(), frontendRupees, serverRupees);
            }
        }

        String notes = (String) body.getOrDefault("notes", body.getOrDefault("description", ""));
        String venue = (String) body.get("venue");
        if (venue != null && !venue.isBlank()) {
            notes = ("Venue: " + venue + (notes.isBlank() ? "" : ". " + notes)).trim();
        }
        order.setDescription(notes);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(Instant.now());

        Order saved = orderRepository.save(order);
        logger.info("Order #{} created in SUBMITTED/PENDING status. Quoted Amount: ₹{}", saved.getId(), serverTotalPaise / 100.0);

        // Notify Admin live in the notification center
        try {
            Notification notification = new Notification();
            notification.setTitle("New Date Booking Request");
            notification.setBody("New booking #" + saved.getId() + " (" + saved.getOccasionType() + ") on " + saved.getBookingDate() + " by " + saved.getClientName() + " (" + saved.getClientEmail() + ", " + saved.getClientPhone() + ").");
            notification.setCategory("booking_request");
            notificationRepository.save(notification);
        } catch (Exception e) {
            logger.warn("Failed to create admin notification for order #{}", saved.getId(), e);
        }

        return ResponseEntity.ok(saved);
    }
}
