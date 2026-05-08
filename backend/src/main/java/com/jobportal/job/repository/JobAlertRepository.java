package com.jobportal.job.repository;

import com.jobportal.job.entity.JobAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobAlertRepository extends JpaRepository<JobAlert, String> {
    @EntityGraph(attributePaths = {"user"})
    Page<JobAlert> findByUserId(String userId, Pageable pageable);
}
