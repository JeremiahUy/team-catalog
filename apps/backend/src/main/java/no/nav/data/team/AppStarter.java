package no.nav.data.team;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.TechnicalException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@ConfigurationPropertiesScan
@SpringBootApplication
public class AppStarter {

    public static void main(String[] args) {
        readAzureSecret();
        SpringApplication.run(AppStarter.class, args);
    }

    private static void readAzureSecret() {
        fileToProp("/var/run/secrets/nais.io/srv/username", "SRV_USER");
        fileToProp("/var/run/secrets/nais.io/srv/password", "SRV_PASSWORD");
    }

    private static void fileToProp(String file, String prop) {
        Path path = Paths.get(file);
        try {
            if (Files.exists(path)) {
                log.info("Reading property={} from={}", prop, file);
                String content = Files.readString(path);
                System.setProperty(prop, content);
            }
        } catch (Exception e) {
            throw new TechnicalException("Couldn't read file " + file);
        }
    }

}
