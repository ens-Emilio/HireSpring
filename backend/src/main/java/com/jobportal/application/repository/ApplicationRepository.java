package com.jobportal.application.repository;

import com.jobportal.application.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {
    @EntityGraph(attributePaths = {"job", "job.company", "candidate"})
    Page<Application> findByCandidateId(String candidateId, Pageable pageable);

    @EntityGraph(attributePaths = {"job", "candidate"})
    Page<Application> findByJobId(String jobId, Pageable pageable);

    boolean existsByCandidateIdAndJobId(String candidateId, String jobId);
    long countByJobId(String jobId);
}
