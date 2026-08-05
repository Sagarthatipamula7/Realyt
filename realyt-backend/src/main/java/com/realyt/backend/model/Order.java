package com.realyt.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_status", columnList = "status")
})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = true)
    private UserAccount client;

    @ManyToOne
    @JoinColumn(name = "editor_id", nullable = true)
    private UserAccount editor;

    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String occasionType;
    private LocalDate bookingDate;
    private Integer reelCount = 1;

    @Column
    private Long quotedAmount; // Server-recalculated authoritative total in paise

    @NotNull
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column
    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column
    private Instant scheduledAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserAccount getClient() { return client; }
    public void setClient(UserAccount client) { this.client = client; }
    public UserAccount getEditor() { return editor; }
    public void setEditor(UserAccount editor) { this.editor = editor; }
    public String getClientName() { return clientName != null ? clientName : (client != null ? client.getFullName() : "Client"); }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientEmail() { return clientEmail != null ? clientEmail : (client != null ? client.getEmail() : null); }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    public String getClientPhone() { return clientPhone; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    public String getOccasionType() { return occasionType; }
    public void setOccasionType(String occasionType) { this.occasionType = occasionType; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public Integer getReelCount() { return reelCount; }
    public void setReelCount(Integer reelCount) { this.reelCount = reelCount; }

    public Long getQuotedAmount() { return quotedAmount; }
    public void setQuotedAmount(Long quotedAmount) { this.quotedAmount = quotedAmount; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }
}
