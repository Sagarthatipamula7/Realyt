package com.realyt.backend.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendOtpEmail(String email, String code) {
        // Placeholder: integrate with SMTP or email API later.
        System.out.printf("[EMAIL] OTP for %s is %s%n", email, code);
    }
}
