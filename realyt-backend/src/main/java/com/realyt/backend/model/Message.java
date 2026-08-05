package com.realyt.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "messages", indexes = {
        @Index(name = "idx_messages_order", columnList = "order_id")
})
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserAccount sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private UserAccount receiver;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @NotBlank
    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserAccount getSender() { return sender; }
    public void setSender(UserAccount sender) { this.sender = sender; }
    public UserAccount getReceiver() { return receiver; }
    public void setReceiver(UserAccount receiver) { this.receiver = receiver; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
