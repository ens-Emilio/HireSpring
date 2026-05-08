package com.jobportal.candidate.repository;

import com.jobportal.candidate.entity.CandidateProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, String> {
    Optional<CandidateProfile> findByUserId(String userId);

    @Query(value = "SELECT * FROM candidate_profiles c WHERE c.skills && :skills::text[]", nativeQuery = true)
    Page<CandidateProfile> findBySkillsContaining(@Param("skills") List<String> skills, Pageable pageable);

    @Query(value = "SELECT * FROM candidate_profiles c WHERE c.skills && :skills::text[] AND LOWER(c.location) LIKE LOWER(CONCAT('%', :location, '%'))", nativeQuery = true)
    Page<CandidateProfile> findBySkillsContainingAndLocationIgnoreCase(@Param("skills") List<String> skills, @Param("location") String location, Pageable pageable);
}
