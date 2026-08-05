package com.realyt.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "availability_slots", indexes = {
        @Index(name = "idx_availability_editor", columnList = "editor_id")
})
public class AvailabilitySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "editor_id", nullable = false)
    private UserAccount editor;

    @Column(nullable = false)
    private Instant startAt;

    @Column(nullable = false)
    private Instant endAt;

    @Column(nullable = false)
    private boolean available = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserAccount getEditor() { return editor; }
    public void setEditor(UserAccount editor) { this.editor = editor; }
    public Instant getStartAt() { return startAt; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }
    public Instant getEndAt() { return endAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
