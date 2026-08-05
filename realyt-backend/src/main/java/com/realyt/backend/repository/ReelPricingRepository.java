package com.realyt.backend.repository;

import com.realyt.backend.model.ReelPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReelPricingRepository extends JpaRepository<ReelPricing, Long> {
    Optional<ReelPricing> findByReelTypeIgnoreCase(String reelType);
}
