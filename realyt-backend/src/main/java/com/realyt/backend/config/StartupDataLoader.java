package com.realyt.backend.config;

import com.realyt.backend.model.*;
import com.realyt.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Configuration
public class StartupDataLoader {

    private static final Logger logger = LoggerFactory.getLogger(StartupDataLoader.class);

    @Bean
    public CommandLineRunner loadInitialData(
            UserAccountRepository userAccountRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            AssignmentRepository assignmentRepository,
            EditorApplicationRepository editorApplicationRepository,
            ReviewRepository reviewRepository,
            MessageRepository messageRepository,
            StripeAccountRepository stripeAccountRepository,
            ReelPricingRepository reelPricingRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            logger.info("Initializing Realyt Comprehensive Database Seeder...");

            String defaultHashedPassword = passwordEncoder.encode("1234567890");

            // ── 1. SEED USER ACCOUNTS (1 Admin, 2 Editors, 2 Clients) ──
            String adminEmail = "thatipamulasagar7@gmail.com";
            UserAccount admin = userAccountRepository.findByEmail(adminEmail).orElseGet(UserAccount::new);
            admin.setEmail(adminEmail);
            admin.setFullName("Sagar Thatipamula");
            admin.setPasswordHash(passwordEncoder.encode("Mitsuha@2003"));
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userAccountRepository.save(admin);

            // Editor 1
            UserAccount ed1 = userAccountRepository.findByEmail("editor1@realyt.com").orElseGet(UserAccount::new);
            ed1.setEmail("editor1@realyt.com");
            ed1.setFullName("Rohan Sharma");
            ed1.setPasswordHash(defaultHashedPassword);
            ed1.setRole(UserRole.EDITOR);
            ed1.setActive(true);
            userAccountRepository.save(ed1);

            // Editor 2
            UserAccount ed2 = userAccountRepository.findByEmail("editor2@realyt.com").orElseGet(UserAccount::new);
            ed2.setEmail("editor2@realyt.com");
            ed2.setFullName("Priya Patel");
            ed2.setPasswordHash(defaultHashedPassword);
            ed2.setRole(UserRole.EDITOR);
            ed2.setActive(true);
            userAccountRepository.save(ed2);

            // Client 1
            UserAccount cl1 = userAccountRepository.findByEmail("client1@realyt.com").orElseGet(UserAccount::new);
            cl1.setEmail("client1@realyt.com");
            cl1.setFullName("Rahul Verma");
            cl1.setPasswordHash(defaultHashedPassword);
            cl1.setRole(UserRole.CLIENT);
            cl1.setActive(true);
            userAccountRepository.save(cl1);

            // Client 2
            UserAccount cl2 = userAccountRepository.findByEmail("client2@realyt.com").orElseGet(UserAccount::new);
            cl2.setEmail("client2@realyt.com");
            cl2.setFullName("Ananya Kapoor");
            cl2.setPasswordHash(defaultHashedPassword);
            cl2.setRole(UserRole.CLIENT);
            cl2.setActive(true);
            userAccountRepository.save(cl2);

            logger.info("Seeded 5 Core User Accounts (1 Admin, 2 Editors, 2 Clients) with password '1234567890'.");

            // ── 2. SEED REEL PRICING RATE CARD ──
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

            // ── 3. SEED 10 ORDERS ──
            if (orderRepository.count() < 10) {
                String[] occasions = {
                    "Wedding Highlight", "Sangeet Night", "Birthday Bash", "Pre-Wedding Shoot", "Baby Shower",
                    "Corporate Summit", "Product Launch", "Anniversary Gala", "Music Concert", "Housewarming Celebration"
                };

                for (int i = 1; i <= 10; i++) {
                    Order order = new Order();
                    order.setOccasionType(occasions[i - 1]);
                    order.setReelCount(1 + (i % 3));
                    order.setBookingDate(LocalDate.now().plusDays(i * 2));
                    order.setQuotedAmount((1200 + i * 200) * 100L);
                    order.setClientName(i % 2 == 0 ? "Rahul Verma" : "Ananya Kapoor");
                    order.setClientEmail(i % 2 == 0 ? "client1@realyt.com" : "client2@realyt.com");
                    order.setClientPhone("+91 98765 432" + (10 + i));
                    order.setDescription("Special instructions for " + occasions[i - 1] + " reel editing.");
                    order.setEditor(i % 2 == 0 ? ed1 : ed2);
                    order.setStatus(i % 3 == 0 ? OrderStatus.COMPLETED : (i % 2 == 0 ? OrderStatus.IN_PROGRESS : OrderStatus.CONFIRMED));
                    Order savedOrder = orderRepository.save(order);

                    // ── 4. SEED 10 PAYMENTS ──
                    Payment payment = new Payment();
                    payment.setOrder(savedOrder);
                    payment.setStripePaymentIntentId("pay_seed10" + i);
                    payment.setAmount(new BigDecimal(1200 + i * 200));
                    payment.setCurrency("INR");
                    payment.setStatus(PaymentStatus.CAPTURED);
                    paymentRepository.save(payment);

                    // ── 5. SEED 10 ASSIGNMENTS ──
                    Assignment assignment = new Assignment();
                    assignment.setOrder(savedOrder);
                    assignment.setEditor(i % 2 == 0 ? ed1 : ed2);
                    assignment.setStatus(AssignmentStatus.ACCEPTED);
                    assignmentRepository.save(assignment);

                    // ── 6. SEED 10 REVIEWS ──
                    Review review = new Review();
                    review.setEditorId(i % 2 == 0 ? ed1.getId() : ed2.getId());
                    review.setClientName(savedOrder.getClientName());
                    review.setOccasionType(savedOrder.getOccasionType());
                    review.setRating(4 + (i % 2));
                    review.setComment("Excellent reel edit for " + occasions[i - 1] + "! Great color grading and music mix.");
                    reviewRepository.save(review);

                    // ── 7. SEED 10 MESSAGES ──
                    Message message = new Message();
                    message.setOrder(savedOrder);
                    message.setSender(i % 2 == 0 ? cl1 : cl2);
                    message.setReceiver(i % 2 == 0 ? ed1 : ed2);
                    message.setContent("Hello Editor! Looking forward to the " + occasions[i - 1] + " draft video cuts.");
                    messageRepository.save(message);
                }
                logger.info("Successfully seeded 10 Orders, 10 Payments, 10 Assignments, 10 Reviews, and 10 Messages!");
            }

            // ── 8. SEED 10 EDITOR APPLICATIONS ──
            if (editorApplicationRepository.count() < 10) {
                String[] applicantNames = {
                    "Vikram Malhotra", "Ananya Verma", "Karan Mehra", "Deepak Roy", "Sneha Rao",
                    "Arjun Kapoor", "Meera Joshi", "Siddharth Nair", "Neha Singh", "Tarun Saxena"
                };

                for (int i = 1; i <= 10; i++) {
                    EditorApplication app = new EditorApplication();
                    app.setName(applicantNames[i - 1]);
                    app.setEmail("applicant" + i + "@example.com");
                    app.setMobile("+91 99887 7665" + i);
                    app.setExperienceLevel(i % 2 == 0 ? "Senior Editor (5+ Yrs)" : "Intermediate (3+ Yrs)");
                    app.setPortfolioUrl("https://vimeo.com/showreel/applicant" + i);
                    app.setNotes("Passionate video editor specializing in cinematic celebration films and reels.");
                    app.setStatus(i <= 4 ? "APPROVED" : (i <= 7 ? "SHORTLISTED" : "NEW"));
                    editorApplicationRepository.save(app);
                }
                logger.info("Successfully seeded 10 Editor Applications!");
            }

            // ── 9. SEED 10 STRIPE PAYOUT ACCOUNTS ──
            if (stripeAccountRepository.count() < 10) {
                List<UserAccount> users = userAccountRepository.findAll();
                for (int i = 1; i <= Math.min(10, users.size()); i++) {
                    StripeAccount sa = new StripeAccount();
                    sa.setUser(users.get(i - 1));
                    sa.setStripeAccountId("acct_seed10" + i);
                    sa.setCountry("IN");
                    sa.setVerified(true);
                    stripeAccountRepository.save(sa);
                }
                logger.info("Successfully seeded 10 Stripe Payout Accounts!");
            }

            logger.info("All Database Seeders Executed Successfully. Realyt platform is fully populated!");
        };
    }
}
