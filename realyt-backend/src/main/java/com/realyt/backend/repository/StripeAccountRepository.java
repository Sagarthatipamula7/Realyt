package com.realyt.backend.repository;

import com.realyt.backend.model.StripeAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StripeAccountRepository extends JpaRepository<StripeAccount, Long> {
    Optional<StripeAccount> findByStripeAccountId(String stripeAccountId);
}
