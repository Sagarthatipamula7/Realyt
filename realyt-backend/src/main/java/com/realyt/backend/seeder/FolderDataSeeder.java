package com.realyt.backend.seeder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.Comparator;

/**
 * Folder Data Seeder Component
 * Scans all SQL files inside src/main/resources/seeders/ folder
 * and populates initial database data on application startup.
 */
@Component
@Order(2)
public class FolderDataSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(FolderDataSeeder.class);
    private final DataSource dataSource;

    public FolderDataSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath*:seeders/*.sql");

            if (resources.length == 0) {
                logger.info("FolderDataSeeder: No .sql seed files found in classpath*:seeders/");
                return;
            }

            Arrays.sort(resources, Comparator.comparing(Resource::getFilename));

            logger.info("FolderDataSeeder: Found {} seed file(s) in seeders/ folder.", resources.length);

            for (Resource resource : resources) {
                logger.info("FolderDataSeeder: Executing seed file -> {}", resource.getFilename());
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(resource);
                populator.setContinueOnError(true);
                populator.setIgnoreFailedDrops(true);
                populator.execute(dataSource);
                logger.info("FolderDataSeeder: Successfully processed -> {}", resource.getFilename());
            }

        } catch (Exception e) {
            logger.warn("FolderDataSeeder encountered an issue while loading folder seed data: {}", e.getMessage());
        }
    }
}
