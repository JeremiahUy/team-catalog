package no.nav.data.team.org;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.resource.NomGraphClient;
import no.nav.nom.graphql.model.OrganisasjonsenhetDto;
import no.nav.nom.graphql.model.OrganisasjonsenhetSearchDto;

@Slf4j
@DgsComponent
@RequiredArgsConstructor
public class OrgDatafetcher {

    private final NomGraphClient nomGraphClient;

    @DgsQuery
    public OrganisasjonsenhetDto org(@InputArgument OrganisasjonsenhetSearchDto where) {
        OrganisasjonsenhetDto org = nomGraphClient.getOrgEnhet(where.getAgressoId()).orElse(null);
        log.debug("Found {}", org);
        return org;
    }
}
