package com.realyt.backend.config;

import com.realyt.backend.model.*;
import com.realyt.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@Configuration
public class StartupDataLoader {

    private static final Logger logger = LoggerFactory.getLogger(StartupDataLoader.class);

    @Bean
    public CommandLineRunner loadInitialData(UserAccountRepository userAccountRepository,
                                             OrderRepository orderRepository,
                                             ReelPricingRepository reelPricingRepository,
                                             PasswordEncoder passwordEncoder) {
        return args -> {
            // Configure ADMIN account (thatipamulasagar7@gmail.com / Mitsuha@2003)
            String adminEmail = "thatipamulasagar7@gmail.com";
            UserAccount admin = userAccountRepository.findByEmail(adminEmail).orElseGet(UserAccount::new);
            admin.setEmail(adminEmail);
            admin.setFullName("Sagar Thatipamula");
            admin.setPasswordHash(passwordEncoder.encode("Mitsuha@2003"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userAccountRepository.save(admin);
            logger.info("Admin account configured successfully for: {}", adminEmail);

            // Seed Rate Card in Paise (divide by 100 for ₹ display)
            Map<String, Long> rateCard = Map.of(
                "Highlight", 120000L,
                "Short", 80000L,
                "Long", 150000L,
                "Story", 90000L,
                "Recap", 100000L,
                "Teaser", 85000L,
                "Sangeet", 130000L,
                "Reception", 130000L,
                "Baraat", 130000L
            );

            rateCard.forEach((type, priceInPaise) -> {
                ReelPricing pricing = reelPricingRepository.findByReelTypeIgnoreCase(type)
                    .orElseGet(ReelPricing::new);
                pricing.setReelType(type);
                pricing.setBasePrice(priceInPaise);
                reelPricingRepository.save(pricing);
            });
            logger.info("Reel rate card seeded successfully. Total rate items: {}", reelPricingRepository.count());

            logger.info("Realyt backend startup ready. Total database orders: {}", orderRepository.count());
        };
    }
}
