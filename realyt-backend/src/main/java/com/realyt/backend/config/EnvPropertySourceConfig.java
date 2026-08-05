package com.realyt.backend.config;

import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.PropertySource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class EnvPropertySourceConfig implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, org.springframework.boot.SpringApplication application) {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            return;
        }

        try (FileInputStream input = new FileInputStream(envFile)) {
            Properties props = new Properties();
            props.load(input);
            Map<String, Object> propertyMap = new HashMap<>();

            copyProperty(props, propertyMap, "DB_HOST", "spring.datasource.hostname");
            copyProperty(props, propertyMap, "DB_PORT", "spring.datasource.port");
            copyProperty(props, propertyMap, "DATABASE_NAME", "spring.datasource.database");
            copyProperty(props, propertyMap, "DATABASE_USER", "spring.datasource.username");
            copyProperty(props, propertyMap, "DATABASE_PASSWORD", "spring.datasource.password");

            if (!propertyMap.isEmpty()) {
                PropertySource<?> propertySource = new MapPropertySource("dotenv", propertyMap);
                environment.getPropertySources().addFirst(propertySource);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Unable to load .env file", e);
        }
    }

    private void copyProperty(Properties props, Map<String, Object> map, String sourceKey, String targetKey) {
        String value = props.getProperty(sourceKey);
        if (value != null && !value.isBlank()) {
            map.put(targetKey, value.trim());
        }
    }
}
