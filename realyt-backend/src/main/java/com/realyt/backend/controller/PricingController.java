package com.realyt.backend.controller;

import com.realyt.backend.model.ReelPricing;
import com.realyt.backend.repository.ReelPricingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "*")
public class PricingController {

    private final ReelPricingRepository reelPricingRepository;

    public PricingController(ReelPricingRepository reelPricingRepository) {
        this.reelPricingRepository = reelPricingRepository;
    }

    @GetMapping
    public ResponseEntity<List<ReelPricing>> getRateCard() {
        return ResponseEntity.ok(reelPricingRepository.findAll());
    }
}
