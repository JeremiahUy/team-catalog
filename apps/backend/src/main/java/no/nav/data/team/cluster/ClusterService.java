package no.nav.data.team.cluster;

import lombok.extern.slf4j.Slf4j;
import no.nav.data.common.exceptions.ValidationException;
import no.nav.data.common.storage.StorageService;
import no.nav.data.common.storage.domain.GenericStorage;
import no.nav.data.common.validator.Validator;
import no.nav.data.team.cluster.domain.Cluster;
import no.nav.data.team.cluster.dto.ClusterRequest;
import no.nav.data.team.team.TeamRepository;
import no.nav.data.team.team.domain.Team;
import no.nav.data.team.team.dto.TeamRequest.Fields;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static no.nav.data.common.utils.StreamUtils.convert;
import static no.nav.data.common.utils.StreamUtils.filter;
import static no.nav.data.common.validator.Validator.ALREADY_EXISTS;

@Slf4j
@Service
public class ClusterService {

    private final StorageService storage;
    private final TeamRepository teamRepository;
    private final ClusterRepository repository;

    public ClusterService(StorageService storage, TeamRepository teamRepository, ClusterRepository repository) {
        this.storage = storage;
        this.teamRepository = teamRepository;
        this.repository = repository;
    }

    public Cluster save(ClusterRequest request) {
        Validator.validate(request, storage)
                .addValidations(this::validateName)
                .ifErrorsThrowValidationException();
        var cluster = request.isUpdate() ? storage.get(request.getIdAsUUID(), Cluster.class) : new Cluster();
        return storage.save(cluster.convert(request));
    }

    public Cluster get(UUID id) {
        return storage.get(id, Cluster.class);
    }

    public List<Cluster> search(String name) {
        return convert(repository.findByNameLike(name), GenericStorage::toCluster);
    }

    public Cluster delete(UUID id) {
        List<Team> teams = teamRepository.findByCluster(id);
        if (!teams.isEmpty()) {
            String message = "Cannot delete cluster, it is in use by " + teams.size() + " teams";
            log.debug(message);
            throw new ValidationException(message);
        }
        return storage.delete(id, Cluster.class);
    }

    public List<Cluster> getAll() {
        return storage.getAll(Cluster.class);
    }

    private void validateName(Validator<ClusterRequest> validator) {
        String name = validator.getItem().getName();
        if (name == null) {
            return;
        }
        List<GenericStorage> teams = filter(repository.findByName(name), t -> !t.getId().equals(validator.getItem().getIdAsUUID()));
        if (teams.stream().anyMatch(t -> t.toCluster().getName().equalsIgnoreCase(name))) {
            validator.addError(Fields.name, ALREADY_EXISTS, "name '" + name + "' already in use");
        }
    }
}
