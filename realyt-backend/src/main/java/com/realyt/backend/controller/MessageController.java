package com.realyt.backend.controller;

import com.realyt.backend.model.Message;
import com.realyt.backend.model.Order;
import com.realyt.backend.model.UserAccount;
import com.realyt.backend.repository.MessageRepository;
import com.realyt.backend.repository.OrderRepository;
import com.realyt.backend.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    private final MessageRepository messageRepository;
    private final UserAccountRepository userAccountRepository;
    private final OrderRepository orderRepository;

    public MessageController(MessageRepository messageRepository, UserAccountRepository userAccountRepository, OrderRepository orderRepository) {
        this.messageRepository = messageRepository;
        this.userAccountRepository = userAccountRepository;
        this.orderRepository = orderRepository;
    }

    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages(@RequestParam(required = false) Long orderId) {
        if (orderId != null) {
            return ResponseEntity.ok(messageRepository.findByOrderIdOrderByCreatedAtAsc(orderId));
        }
        return ResponseEntity.ok(messageRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> body) {
        Message message = new Message();

        Long senderId = body.containsKey("senderId") ? Long.parseLong(body.get("senderId").toString()) : 1L;
        Long receiverId = body.containsKey("receiverId") ? Long.parseLong(body.get("receiverId").toString()) : null;
        Long orderId = body.containsKey("orderId") ? Long.parseLong(body.get("orderId").toString()) : null;
        String content = body.containsKey("content") ? body.get("content").toString() : "";

        Optional<UserAccount> senderOpt = userAccountRepository.findById(senderId);
        if (senderOpt.isPresent()) {
            message.setSender(senderOpt.get());
        } else {
            List<UserAccount> users = userAccountRepository.findAll();
            if (!users.isEmpty()) {
                message.setSender(users.get(0));
            } else {
                return ResponseEntity.badRequest().build();
            }
        }

        if (receiverId != null) {
            userAccountRepository.findById(receiverId).ifPresent(message::setReceiver);
        }

        if (orderId != null) {
            orderRepository.findById(orderId).ifPresent(message::setOrder);
        }

        message.setContent(content);
        Message saved = messageRepository.save(message);
        logger.info("Message saved into PostgreSQL messages table: {}", saved.getId());
        return ResponseEntity.ok(saved);
    }
}
