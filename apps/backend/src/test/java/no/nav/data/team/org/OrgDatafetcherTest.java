package no.nav.data.team.org;

import no.nav.data.team.GraphQlTestBase;
import no.nav.nom.graphql.model.OrganisasjonsenhetDto;
import org.junit.jupiter.api.Test;

import static java.util.Optional.ofNullable;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class OrgDatafetcherTest extends GraphQlTestBase {

    @Test
    void getOrg() {
        when(nomGraphClient.getOrgEnhet("1")).thenReturn(ofNullable(OrganisasjonsenhetDto.builder()
                .setAgressoId("1")
                .setNavn("navn")
                .build()));

        var org = dgsQueryExecutor.executeAndExtractJsonPathAsObject(
                " { org(where: {agressoId: \"1\"}) { agressoId navn } } ",
                "$.data.org",
                OrganisasjonsenhetDto.class
        );

        assertThat(org.getAgressoId()).isEqualTo("1");
    }
}