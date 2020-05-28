package no.nav.data.team.po;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.team.common.exceptions.ValidationException;
import no.nav.data.team.common.storage.StorageService;
import no.nav.data.team.common.storage.domain.GenericStorage;
import no.nav.data.team.common.validator.Validator;
import no.nav.data.team.graph.GraphService;
import no.nav.data.team.po.domain.ProductArea;
import no.nav.data.team.po.dto.AddTeamsToProductAreaRequest;
import no.nav.data.team.po.dto.ProductAreaRequest;
import no.nav.data.team.team.TeamRepository;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.team.common.utils.StreamUtils.convert;
import static no.nav.data.team.common.utils.StreamUtils.filter;
import static no.nav.data.team.common.validator.Validator.ALREADY_EXISTS;

@Slf4j
@Service
public class ProductAreaService {

    private final StorageService storage;
    private final TeamRepository teamRepository;
    private final ProductAreaRepository repository;
    private final GraphService graphService;

    public ProductAreaService(StorageService storage, TeamRepository teamRepository, ProductAreaRepository repository, GraphService graphService) {
        this.storage = storage;
        this.teamRepository = teamRepository;
        this.repository = repository;
        this.graphService = graphService;
    }

    public ProductArea save(ProductAreaRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateName)
                .ifErrorsThrowValidationException();
        var productArea = request.isUpdate() ? storage.get(request.getIdAsUUID(), ProductArea.class) : new ProductArea();
        return storage.save(productArea.convert(request));
    }

    public ProductArea get(UUID id) {
        return storage.get(id, ProductArea.class);
    }

    public List<ProductArea> search(String name) {
        return convert(repository.findByNameLike(name), GenericStorage::toProductArea);
    }

    public ProductArea delete(UUID id) {
        List<GenericStorage> teams = teamRepository.findByProductArea(id);
        if (!teams.isEmpty()) {
            String message = "Cannot delete product area, it is in use by " + teams.size() + " teams";
            log.debug(message);
            throw new ValidationException(message);
        }
        ProductArea delete = storage.delete(id, ProductArea.class);
        graphService.deleteProductArea(delete);
        return delete;
    }

    public List<ProductArea> getAll() {
        return storage.getAll(ProductArea.class);
    }

    public void addTeams(AddTeamsToProductAreaRequest request) {
        Validator.validate(request)
                .addValidations(validator -> validator.checkExists(request.getProductAreaId(), storage, ProductArea.class))
                .addValidations(AddTeamsToProductAreaRequest::getTeamIds, (validator, teamId) -> validator.checkExists(teamId, storage, Team.class))
                .ifErrorsThrowValidationException();

        request.getTeamIds().forEach(teamId -> {
            var team = storage.get(UUID.fromString(teamId), Team.class);
            team.setProductAreaId(request.getProductAreaId());
            team.setUpdateSent(false);
            storage.save(team);
        });
    }

    private void validateName(Validator<ProductAreaRequest> validator) {
        String name = validator.getItem().getName();
        if (name == null) {
            return;
        }
        List<GenericStorage> teams = filter(repository.findByName(name), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (teams.stream().anyMatch(t -> t.toProductArea().getName().equalsIgnoreCase(name))) {
            validator.addError(Fields.name, ALREADY_EXISTS, "name '" + name + "' already in use");
        }
    }
}
