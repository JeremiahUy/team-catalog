package no.nav.data.team.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;
import no.nav.data.common.validator.RequestElement;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.contact.domain.ContactAddress;
import no.nav.data.team.team.domain.OfficeHours;
import no.nav.data.team.shared.domain.DomainObjectStatus;
import no.nav.data.team.team.domain.TeamType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StringUtils.formatList;
import static org.apache.commons.lang3.StringUtils.trimToNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldNameConstants
public class TeamRequest implements RequestElement {

    private String id;
    private String name;
    private String description;
    private String slackChannel;
    private String contactPersonIdent;
    private List<ContactAddress> contactAddresses;
    private String productAreaId;
    private String teamOwnerIdent;
    private List<String> clusterIds;
    private TeamType teamType;
    private LocalDateTime qaTime;
    private List<String> naisTeams;
    private List<TeamMemberRequest> members;
    private List<String> tags;
    private OfficeHours officeHours;
    private DomainObjectStatus status;


    private Boolean update;

    @Override
    public void format() {
        setName(trimToNull(name));
        setDescription(trimToNull(description));
        setSlackChannel(trimToNull(slackChannel));
        setContactPersonIdent(trimToNull(contactPersonIdent));
        setProductAreaId(trimToNull(productAreaId));
        setClusterIds(formatList(clusterIds));
        setNaisTeams(formatList(naisTeams));
        setTags(formatList(tags));
        if (teamType == null) {
            setTeamType(TeamType.UNKNOWN);
        }
    }

    @Override
    public void validateFieldValues(Validator<?> validator) {
        validator.checkId(this);
        validator.checkUUID(Fields.id, id);
        validator.checkUUID(Fields.productAreaId, productAreaId);
        clusterIds.forEach(id -> validator.checkUUID(Fields.clusterIds, id));
        validator.checkBlank(Fields.name, name);
        validator.checkBlank(Fields.description, description);
        validator.validateType(Fields.members, members);
        validator.validateType(Fields.contactAddresses, contactAddresses);
    }

    public UUID productAreaIdAsUUID() {
        return productAreaId != null ? UUID.fromString(productAreaId) : null;
    }
}
