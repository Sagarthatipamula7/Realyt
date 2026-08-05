package com.realyt.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reel_pricings")
public class ReelPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reelType;

    @Column(nullable = false)
    private Long basePrice; // Price in paise (e.g. 120000 paise = ₹1,200)

    public ReelPricing() {}

    public ReelPricing(String reelType, Long basePrice) {
        this.reelType = reelType;
        this.basePrice = basePrice;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReelType() { return reelType; }
    public void setReelType(String reelType) { this.reelType = reelType; }

    public Long getBasePrice() { return basePrice; }
    public void setBasePrice(Long basePrice) { this.basePrice = basePrice; }
}
