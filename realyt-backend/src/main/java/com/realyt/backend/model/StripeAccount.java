package com.realyt.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "stripe_accounts", indexes = {
        @Index(name = "idx_stripe_account_user", columnList = "user_id")
})
public class StripeAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(nullable = false)
    private String stripeAccountId;

    @Column
    private String country;

    @Column
    private boolean verified = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserAccount getUser() { return user; }
    public void setUser(UserAccount user) { this.user = user; }
    public String getStripeAccountId() { return stripeAccountId; }
    public void setStripeAccountId(String stripeAccountId) { this.stripeAccountId = stripeAccountId; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}
