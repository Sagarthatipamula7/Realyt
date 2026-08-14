package com.realyt.backend.controller;

import com.realyt.backend.model.StripeAccount;
import com.realyt.backend.model.UserAccount;
import com.realyt.backend.repository.StripeAccountRepository;
import com.realyt.backend.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stripe-accounts")
public class StripeAccountController {

    private static final Logger logger = LoggerFactory.getLogger(StripeAccountController.class);

    private final StripeAccountRepository stripeAccountRepository;
    private final UserAccountRepository userAccountRepository;

    public StripeAccountController(StripeAccountRepository stripeAccountRepository, UserAccountRepository userAccountRepository) {
        this.stripeAccountRepository = stripeAccountRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @GetMapping
    public ResponseEntity<List<StripeAccount>> getAllStripeAccounts() {
        return ResponseEntity.ok(stripeAccountRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<StripeAccount> createStripeAccount(@RequestBody Map<String, Object> body) {
        StripeAccount account = new StripeAccount();

        Long userId = body.containsKey("userId") ? Long.parseLong(body.get("userId").toString()) : 1L;
        String stripeAccountId = body.containsKey("stripeAccountId") ? body.get("stripeAccountId").toString() : "acct_demo123";
        String country = body.containsKey("country") ? body.get("country").toString() : "IN";

        Optional<UserAccount> userOpt = userAccountRepository.findById(userId);
        if (userOpt.isPresent()) {
            account.setUser(userOpt.get());
        } else {
            List<UserAccount> users = userAccountRepository.findAll();
            if (!users.isEmpty()) {
                account.setUser(users.get(0));
            } else {
                return ResponseEntity.badRequest().build();
            }
        }

        account.setStripeAccountId(stripeAccountId);
        account.setCountry(country);
        account.setVerified(true);

        StripeAccount saved = stripeAccountRepository.save(account);
        logger.info("Stripe account saved into PostgreSQL stripe_accounts table: {}", saved.getId());
        return ResponseEntity.ok(saved);
    }
}
