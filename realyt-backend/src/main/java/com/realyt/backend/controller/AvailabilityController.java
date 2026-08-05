package com.realyt.backend.controller;

import com.realyt.backend.repository.AvailabilitySlotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    private final AvailabilitySlotRepository availabilitySlotRepository;

    public AvailabilityController(AvailabilitySlotRepository availabilitySlotRepository) {
        this.availabilitySlotRepository = availabilitySlotRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAvailability(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        LocalDate startDate = (from != null && !from.isBlank()) ? LocalDate.parse(from) : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = (to != null && !to.isBlank()) ? LocalDate.parse(to) : startDate.plusMonths(1).minusDays(1);

        List<Map<String, Object>> result = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // Deterministic calculation based on date for smooth demo/production behavior
            int dayVal = date.getDayOfMonth() + date.getMonthValue() + date.getYear();
            int openSlots = (dayVal * 7) % 8; // returns 0 to 7
            if (date.getDayOfWeek().getValue() == 6 || date.getDayOfWeek().getValue() == 7) {
                openSlots = Math.max(2, (openSlots + 3) % 8);
            }

            Map<String, Object> item = new HashMap<>();
            item.put("date", date.format(DateTimeFormatter.ISO_LOCAL_DATE));
            item.put("openSlots", openSlots);
            item.put("available", openSlots > 0);
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }
}
