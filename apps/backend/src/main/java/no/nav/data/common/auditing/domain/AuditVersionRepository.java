package no.nav.data.common.auditing.domain;

import no.nav.data.common.auditing.dto.AuditMetadata;
import no.nav.data.team.notify.domain.TeamAuditMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditVersionRepository extends JpaRepository<AuditVersion, UUID> {

    @Query(value = """
            SELECT * FROM audit_version
            WHERE :timeFrom < time AND time <= timeTo
            """, nativeQuery = true)
    List<AuditVersion> getByTimeBetween(LocalDate timeFrom, LocalDate timeTo);

    @Query(value = """
            SELECT * FROM audit_version t1
            WHERE t1.audit_id = (
                SELECT t2.audit_id FROM audit_version t2
                WHERE t2.DATA ->> 'id' = t1.DATA ->> 'id'
                AND t2.TIME <= :time
                ORDER BY t2.TIME DESC
                LIMIT 1
            )
            """, nativeQuery = true)
    List<AuditVersion> getLatestAuditVersionForAll(LocalDate time);

    Page<AuditVersion> findByTable(String table, Pageable pageable);

    List<AuditVersion> findByTableIdOrderByTimeDesc(String tableId);

    @Query(value = "select * from audit_version where table_id = ?1 order by time desc limit 1", nativeQuery = true)
    AuditVersion findByTableIdOrderByTimeDescLimitOne(String tableId);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where time > (select time from audit_version where audit_id = ?1) "
            + "and (table_name = 'Team' or table_name = 'ProductArea') "
            + "order by time", nativeQuery = true)
    List<AuditMetadata> getAllMetadataAfter(UUID id);

    @Query(value = """
            select distinct on (table_id)
             cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId,
             data #>> '{data,productAreaId}' as productAreaId
             from audit_version
             where table_name = 'Team'
                and action <> 'DELETE'
                and time < ?1
             order by table_id, time desc
            """, nativeQuery = true)
    List<TeamAuditMetadata> getTeamMetadataBefore(LocalDateTime time);

    @Query(value = """
            select distinct on (table_id)
             cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId,
             data #>> '{data,productAreaId}' as productAreaId
             from audit_version
             where table_name = 'Team'
              and action <> 'DELETE'
              and time >= ?1
              and time <= ?2
             order by table_id, time desc
             """,
            nativeQuery = true)
    List<TeamAuditMetadata> getTeamMetadataBetween(LocalDateTime start, LocalDateTime end);


    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version where audit_id in ?1", nativeQuery = true)
    List<AuditMetadata> getMetadataByIds(List<UUID> uuids);

    @Query(value = "select cast(audit_id as text) from audit_version "
            + "where table_id = (select table_id from audit_version where audit_id = ?1) "
            + "and time < (select time from audit_version where audit_id = ?1) "
            + "order by time desc limit 1", nativeQuery = true)
    String getPreviousAuditIdFor(UUID id);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId "
            + "from audit_version "
            + "where table_id = cast(?1 as text) order by time desc limit 1", nativeQuery = true)
    AuditMetadata lastAuditForObject(UUID uuid);

    @Query(value = "select cast(audit_id as text) as id, time, action, table_name as tableName, table_id as tableId"
            + " from audit_version where time between ?1 and ?2 "
            + " and (table_name = 'Team' or table_name = 'ProductArea') "
            + " order by time"
            , nativeQuery = true)
    List<AuditMetadata> findByTimeBetween(LocalDateTime start, LocalDateTime end);
}
