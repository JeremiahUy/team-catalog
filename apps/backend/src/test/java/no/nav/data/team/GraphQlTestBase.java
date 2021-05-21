package no.nav.data.team;

import com.netflix.graphql.dgs.DgsQueryExecutor;
import com.netflix.graphql.dgs.autoconfig.DgsAutoConfiguration;
import no.nav.data.common.dgs.DgsConfig;
import no.nav.data.team.GraphQlTestBase.Config;
import no.nav.data.team.org.OrgDatafetcher;
import no.nav.data.team.resource.NomGraphClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@SpringBootTest(classes = {DgsAutoConfiguration.class, DgsConfig.class, Config.class})
public class GraphQlTestBase {

    @Autowired
    protected DgsQueryExecutor dgsQueryExecutor;
    @MockBean
    protected NomGraphClient nomGraphClient;

    @Configuration
    @Import({OrgDatafetcher.class})
    public static class Config {

    }

}
