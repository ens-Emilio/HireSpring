package com.jobportal.job.repository;

import com.jobportal.job.entity.Job;
import com.jobportal.job.entity.JobLevel;
import com.jobportal.job.entity.JobStatus;
import com.jobportal.job.entity.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j WHERE j.status = 'ACTIVE' AND " +
           "(:search IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:remote IS NULL OR j.isRemote = :remote) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:level IS NULL OR j.level = :level)")
    Page<Job> searchJobs(@Param("search") String search,
                         @Param("remote") Boolean remote,
                         @Param("jobType") JobType jobType,
                         @Param("level") JobLevel level,
                         Pageable pageable);

    long countByStatus(JobStatus status);

    @Modifying
    @Query("UPDATE Job j SET j.viewCount = j.viewCount + 1 WHERE j.id = :id")
    void incrementViewCount(@Param("id") String id);

    @Modifying
    @Query("UPDATE Job j SET j.applicationCount = j.applicationCount + 1 WHERE j.id = :id")
    void incrementApplicationCount(@Param("id") String id);

    @Query("SELECT COUNT(DISTINCT j.company.id) FROM Job j")
    long countDistinctCompanies();
}
