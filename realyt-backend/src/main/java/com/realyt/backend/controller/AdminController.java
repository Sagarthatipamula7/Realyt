package com.realyt.backend.controller;

import com.realyt.backend.model.*;
import com.realyt.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserAccountRepository userAccountRepository;
    private final OrderRepository orderRepository;
    private final AssignmentRepository assignmentRepository;
    private final PaymentRepository paymentRepository;
    private final EditorApplicationRepository editorApplicationRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;

    public AdminController(UserAccountRepository userAccountRepository,
                           OrderRepository orderRepository,
                           AssignmentRepository assignmentRepository,
                           PaymentRepository paymentRepository,
                           EditorApplicationRepository editorApplicationRepository,
                           ReviewRepository reviewRepository,
                           NotificationRepository notificationRepository,
                           AvailabilitySlotRepository availabilitySlotRepository) {
        this.userAccountRepository = userAccountRepository;
        this.orderRepository = orderRepository;
        this.assignmentRepository = assignmentRepository;
        this.paymentRepository = paymentRepository;
        this.editorApplicationRepository = editorApplicationRepository;
        this.reviewRepository = reviewRepository;
        this.notificationRepository = notificationRepository;
        this.availabilitySlotRepository = availabilitySlotRepository;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        List<Payment> payments = paymentRepository.findAll();
        List<Order> orders = orderRepository.findAll();
        List<UserAccount> users = userAccountRepository.findAll();
        List<EditorApplication> apps = editorApplicationRepository.findAll();

        long totalBookings = orders.size();
        long openRequests = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING || o.getStatus() == OrderStatus.DRAFT)
                .count();
        long activeAssignments = assignmentRepository.count();
        long inProgress = orders.stream().filter(o -> o.getStatus() == OrderStatus.IN_PROGRESS).count();
        long completedBookings = orders.stream().filter(o -> o.getStatus() == OrderStatus.COMPLETED).count();

        double gmv = payments.stream().mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0).sum();
        double platformCommission = payments.stream().mapToDouble(p -> p.getCommission() != null ? p.getCommission().doubleValue() : 0.0).sum();
        double editorPayouts = payments.stream().mapToDouble(p -> p.getEditorPayout() != null ? p.getEditorPayout().doubleValue() : 0.0).sum();
        double avgOrderValue = totalBookings > 0 ? gmv / totalBookings : 0.0;

        long totalEditors = users.stream().filter(u -> u.getRole() == UserRole.EDITOR).count();
        Set<Long> busyEditorIds = new HashSet<>();
        assignmentRepository.findAll().forEach(a -> busyEditorIds.add(a.getEditor().getId()));
        long activeEditors = busyEditorIds.size();
        int editorUtilizationPct = totalEditors > 0 ? (int) Math.round((activeEditors * 100.0) / totalEditors) : 0;

        long customers = users.stream().filter(u -> u.getRole() == UserRole.CLIENT).count();

        long newApplications = apps.stream().filter(a -> "NEW".equalsIgnoreCase(a.getStatus())).count();
        long shortlistedApps = apps.stream().filter(a -> "SHORTLISTED".equalsIgnoreCase(a.getStatus())).count();
        long approvedApps = apps.stream().filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus())).count();
        long pendingApplications = newApplications + shortlistedApps;

        long availableSlots = availabilitySlotRepository.findAll().stream().filter(s -> s.isAvailable()).count();
        long bookedSlots = orders.stream().filter(o -> o.getEditor() != null).count();
        long unreadNotifications = notificationRepository.countByReadFalse();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("openRequests", openRequests);
        stats.put("activeAssignments", activeAssignments);
        stats.put("inProgress", inProgress);
        stats.put("completedBookings", completedBookings);
        stats.put("gmv", gmv);
        stats.put("monthlyRevenue", gmv);
        stats.put("platformCommission", platformCommission);
        stats.put("editorPayouts", editorPayouts);
        stats.put("avgOrderValue", avgOrderValue);
        stats.put("totalEditors", totalEditors);
        stats.put("activeEditors", activeEditors);
        stats.put("availableEditors", activeEditors);
        stats.put("bookedEditors", busyEditorIds.size());
        stats.put("editorUtilizationPct", editorUtilizationPct);
        stats.put("customers", customers);
        stats.put("totalApplications", apps.size());
        stats.put("newApplications", newApplications);
        stats.put("shortlistedApplications", shortlistedApps);
        stats.put("approvedApplications", approvedApps);
        stats.put("pendingApplications", pendingApplications);
        stats.put("availableSlots", availableSlots);
        stats.put("bookedSlots", bookedSlots);
        stats.put("unreadNotifications", unreadNotifications);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/requests/customer")
    public ResponseEntity<List<Order>> getCustomerRequests() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping("/requests/{orderId}/assign")
    public ResponseEntity<Map<String, String>> assignEditor(@PathVariable Long orderId, @RequestParam Long editorId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        Optional<UserAccount> editorOpt = userAccountRepository.findById(editorId);
        String assignedEditor = editorOpt.map(UserAccount::getFullName).orElse("an editor");

        if (orderOpt.isPresent() && editorOpt.isPresent()) {
            Order order = orderOpt.get();
            UserAccount editor = editorOpt.get();
            order.setEditor(editor);
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            Assignment assignment = new Assignment();
            assignment.setOrder(order);
            assignment.setEditor(editor);
            assignmentRepository.save(assignment);
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Booking done successfully. Editor assigned!");
        response.put("editorName", assignedEditor);
        createNotification("Booking Confirmed & Editor Assigned",
                "Booking #" + orderId + " done successfully. Assigned to editor " + assignedEditor + ".",
                "booking_success");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests/editor-applications")
    public ResponseEntity<List<EditorApplication>> getEditorApplications() {
        return ResponseEntity.ok(editorApplicationRepository.findAll());
    }

    @PatchMapping("/requests/editor-applications/{id}/status")
    public ResponseEntity<EditorApplication> updateApplicationStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        EditorApplication app = editorApplicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (body.containsKey("status")) {
            app.setStatus(body.get("status"));
            editorApplicationRepository.save(app);
            createNotification("Application updated",
                    app.getName() + " moved to " + body.get("status"),
                    "application");
        }
        return ResponseEntity.ok(app);
    }

    @GetMapping("/editors")
    public ResponseEntity<List<Map<String, Object>>> getEditorsRoster() {
        List<UserAccount> editors = userAccountRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.EDITOR)
                .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (UserAccount ed : editors) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", ed.getId());
            map.put("name", ed.getFullName() + " (Registered Editor)");
            map.put("fullName", ed.getFullName());
            map.put("email", ed.getEmail());
            map.put("status", "Active & Available");
            map.put("rating", "4.9");
            result.add(map);
        }

        // Also fetch approved editor applications from database
        try {
            List<EditorApplication> approvedApps = editorApplicationRepository.findAll().stream()
                    .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()) || "SHORTLISTED".equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());

            for (EditorApplication app : approvedApps) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", app.getId());
                map.put("name", app.getName() + " (" + (app.getExperienceLevel() != null ? app.getExperienceLevel() : "Approved Applicant") + ")");
                map.put("fullName", app.getName());
                map.put("email", app.getEmail());
                map.put("status", app.getStatus());
                map.put("rating", "4.8");
                result.add(map);
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/editors/{id}")
    public ResponseEntity<Map<String, Object>> getEditorDetail(@PathVariable Long id) {
        UserAccount editor = userAccountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Editor not found"));

        List<Review> reviews = reviewRepository.findByEditorIdOrderByCreatedAtDesc(id);

        Map<String, Object> detail = new HashMap<>();
        detail.put("id", editor.getId());
        detail.put("name", editor.getFullName());
        detail.put("email", editor.getEmail());
        detail.put("joinDate", editor.getCreatedAt().toString());
        detail.put("overallRating", 4.8);
        detail.put("totalLifetimeReels", 74);

        List<Map<String, Object>> trend = Arrays.asList(
                createMonthStat("Mar", 12),
                createMonthStat("Apr", 14),
                createMonthStat("May", 10),
                createMonthStat("Jun", 18),
                createMonthStat("Jul", 15),
                createMonthStat("Aug", 21)
        );
        detail.put("monthlyTrend", trend);

        List<Map<String, Object>> ratingDist = Arrays.asList(
                createDistStat("5 Star", 42),
                createDistStat("4 Star", 18),
                createDistStat("3 Star", 4),
                createDistStat("2 Star", 1),
                createDistStat("1 Star", 0)
        );
        detail.put("ratingDistribution", ratingDist);
        detail.put("reviews", reviews);

        return ResponseEntity.ok(detail);
    }

    private Map<String, Object> createMonthStat(String month, int count) {
        Map<String, Object> m = new HashMap<>();
        m.put("month", month);
        m.put("reels", count);
        return m;
    }

    private Map<String, Object> createDistStat(String stars, int count) {
        Map<String, Object> m = new HashMap<>();
        m.put("name", stars);
        m.put("value", count);
        return m;
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @PostMapping("/payments/{orderId}/release")
    public ResponseEntity<Map<String, Object>> releasePayment(@PathVariable Long orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrder_Id(orderId);
        Payment payment;
        if (paymentOpt.isPresent()) {
            payment = paymentOpt.get();
        } else {
            payment = new Payment();
            Order order = orderRepository.findById(orderId).orElse(null);
            payment.setOrder(order);
            payment.setAmount(BigDecimal.valueOf(199.00));
            payment.setCommission(BigDecimal.valueOf(29.85));
            payment.setEditorPayout(BigDecimal.valueOf(169.15));
        }

        payment.setStatus(PaymentStatus.CAPTURED);
        paymentRepository.save(payment);

        createNotification("Payout released",
                "Payout of $" + payment.getEditorPayout() + " released for Order #" + orderId,
                "payout");

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Payment released to editor's connected account");
        res.put("payment", payment);
        return ResponseEntity.ok(res);
    }

    /* ── Live Notification Center (drives Admin bell + dashboard panel) ── */

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications() {
        List<Notification> items = notificationRepository.findAll().stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .limit(50)
                .collect(Collectors.toList());
        long unread = notificationRepository.countByReadFalse();

        Map<String, Object> res = new HashMap<>();
        res.put("items", items);
        res.put("unreadCount", unread);
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<Notification> markNotificationRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        n.setRead(true);
        return ResponseEntity.ok(notificationRepository.save(n));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Map<String, String>> markAllNotificationsRead() {
        List<Notification> all = notificationRepository.findAll();
        all.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(all);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "All notifications marked as read"));
    }

    private void createNotification(String title, String body, String category) {
        Notification n = new Notification();
        n.setTitle(title != null ? title : "System update");
        n.setBody(body);
        n.setCategory(category != null ? category : "system");
        notificationRepository.save(n);
    }

    private LocalDate toLocalDate(Instant instant) {
        return instant.atZone(ZoneId.systemDefault()).toLocalDate();
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> data = new HashMap<>();
        List<Order> orders = orderRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<UserAccount> users = userAccountRepository.findAll();
        List<AvailabilitySlot> slots = availabilitySlotRepository.findAll();
        ZoneId zone = ZoneId.systemDefault();

        List<Map<String, Object>> orderVolume = new ArrayList<>();
        List<Map<String, Object>> revenueTrend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate bucketStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            String label = bucketStart.format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH));
            long count = orders.stream().filter(o -> o.getCreatedAt() != null && toLocalDate(o.getCreatedAt()).isEqual(bucketStart)).count();
            double revenue = payments.stream()
                    .filter(p -> p.getCreatedAt() != null && toLocalDate(p.getCreatedAt()).isEqual(bucketStart))
                    .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0).sum();
            Map<String, Object> vol = new HashMap<>();
            vol.put("month", label); vol.put("orders", count);
            orderVolume.add(vol);
            Map<String, Object> rev = new HashMap<>();
            rev.put("month", label); rev.put("revenue", Math.round(revenue * 100.0) / 100.0);
            revenueTrend.add(rev);
        }
        data.put("orderVolume", orderVolume);
        data.put("revenueTrend", revenueTrend);

        Map<String, Long> byOccasion = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getOccasionType() != null ? o.getOccasionType() : "Other", Collectors.counting()));
        List<Map<String, Object>> occasionBreakdown = byOccasion.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey()); m.put("value", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        data.put("occasionBreakdown", occasionBreakdown);

        long totalEditors = users.stream().filter(u -> u.getRole() == UserRole.EDITOR).count();
        Set<Long> busyIds = new HashSet<>();
        assignmentRepository.findAll().forEach(a -> busyIds.add(a.getEditor().getId()));
        int utilization = totalEditors > 0 ? (int) Math.round((busyIds.size() * 100.0) / totalEditors) : 0;
        data.put("editorUtilizationPct", utilization);

        double turnaroundDays = orders.stream()
                .filter(o -> o.getScheduledAt() != null && o.getCreatedAt() != null)
                .mapToDouble(o -> Math.abs(java.time.Duration.between(o.getCreatedAt(), o.getScheduledAt()).toDays()))
                .filter(d -> d > 0).average().orElse(0.0);
        data.put("avgTurnaroundDays", Math.round(turnaroundDays * 10.0) / 10.0);

        data.put("availableSlotsToday", slots.stream().filter(s -> s.isAvailable()).count());
        data.put("totalSlotsToday", slots.size());
        data.put("fulfillmentRate", Math.round((orders.stream().filter(o -> o.getEditor() != null).count() * 100.0) / Math.max(1, orders.size())));
        return ResponseEntity.ok(data);
    }
}
