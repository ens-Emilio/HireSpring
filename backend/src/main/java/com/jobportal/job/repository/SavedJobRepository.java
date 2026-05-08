package com.jobportal.job.repository;

import com.jobportal.job.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, String> {
    @EntityGraph(attributePaths = {"job", "job.company"})
    Page<SavedJob> findByUserId(String userId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "job.company"})
    Optional<SavedJob> findByUserIdAndJobId(String userId, String jobId);

    boolean existsByUserIdAndJobId(String userId, String jobId);
    void deleteByUserIdAndJobId(String userId, String jobId);
}
