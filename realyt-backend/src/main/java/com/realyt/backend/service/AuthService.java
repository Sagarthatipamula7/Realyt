package com.realyt.backend.service;

import com.realyt.backend.dto.AuthRequest;
import com.realyt.backend.dto.AuthResponse;
import com.realyt.backend.dto.OtpRequest;
import com.realyt.backend.dto.ResetPasswordRequest;
import com.realyt.backend.model.OtpCode;
import com.realyt.backend.model.UserAccount;
import com.realyt.backend.model.UserRole;
import com.realyt.backend.repository.OtpCodeRepository;
import com.realyt.backend.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserAccountRepository userAccountRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public AuthService(UserAccountRepository userAccountRepository,
                       OtpCodeRepository otpCodeRepository,
                       JwtService jwtService) {
        this.userAccountRepository = userAccountRepository;
        this.otpCodeRepository = otpCodeRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse login(AuthRequest request) {
        UserAccount user = userAccountRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("User account does not exist."));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account disabled or inactive.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getEmail());
        logger.info("User logged in successfully with ID: {}, email: {}", user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), "Login successful");
    }

    public AuthResponse adminLogin(AuthRequest request) {
        UserAccount user = userAccountRepository.findByEmail(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> new IllegalArgumentException("User account does not exist."));

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account disabled or inactive.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid admin email or password.");
        }

        if (user.getRole() != UserRole.ADMIN) {
            logger.warn("Non-admin user attempt to access admin login: {}", request.getEmail());
            throw new IllegalArgumentException("Access denied. User does not have ADMIN privileges.");
        }

        String token = jwtService.generateToken(user.getEmail());
        logger.info("Admin logged in successfully: ID: {}, email: {}", user.getId(), user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), "Login successful");
    }

    public AuthResponse signup(AuthRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email address is required");
        }
        if (!request.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new IllegalArgumentException("Enter a valid email address");
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters long");
        }
        if (userAccountRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        UserAccount user = new UserAccount();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        String displayName = (request.getName() != null && !request.getName().isBlank())
            ? request.getName()
            : (request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : email.split("@")[0]);
        user.setFullName(displayName);
        
        UserRole targetRole = UserRole.CLIENT;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                targetRole = UserRole.valueOf(request.getRole().trim().toUpperCase());
            } catch (Exception ignored) {
                targetRole = UserRole.CLIENT;
            }
        }
        user.setRole(targetRole);
        user.setActive(true);

        UserAccount savedUser = userAccountRepository.save(user);
        logger.info("User created successfully with ID: {}, email: {}, role: {}", 
                savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        String token = jwtService.generateToken(savedUser.getEmail());
        return new AuthResponse(token, email, savedUser.getRole().name(),
                "Account created successfully. You are now logged in.");
    }

    private String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }

    public String sendOtp(OtpRequest request) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        OtpCode otpCode = new OtpCode();
        otpCode.setEmail(request.getEmail());
        otpCode.setCode(code);
        otpCode.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        otpCode.setUsed(false);
        otpCodeRepository.save(otpCode);

        return code;
    }

    public String resetPassword(ResetPasswordRequest request) {
        Optional<OtpCode> maybeOtp = otpCodeRepository.findTopByEmailOrderByCreatedAtDesc(request.getEmail());
        if (maybeOtp.isEmpty()) {
            throw new IllegalArgumentException("OTP not found");
        }

        OtpCode otpCode = maybeOtp.get();
        if (otpCode.isUsed() || !otpCode.getCode().equals(request.getOtp()) || otpCode.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("OTP is invalid or expired");
        }

        UserAccount user = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userAccountRepository.save(user);

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        return "Password reset successfully";
    }
}
