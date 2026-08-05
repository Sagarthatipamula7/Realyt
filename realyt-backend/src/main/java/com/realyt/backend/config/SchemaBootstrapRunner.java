package com.realyt.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Idempotent schema bootstrap that runs before the {@link StartupDataLoader}.
 * Guarantees columns introduced on the entities exist regardless of how the
 * schema was first created (Hibernate {@code ddl-auto=update} does not always
 * apply new columns to an existing table on some setups).
 */
@Component
@Order(1)
public class SchemaBootstrapRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaBootstrapRunner(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE");
    }
}