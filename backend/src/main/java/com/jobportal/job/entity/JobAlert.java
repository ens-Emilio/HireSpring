package com.jobportal.job.entity;

import com.jobportal.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> keywords;

    private String location;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    private boolean isRemote;

    public enum Frequency {
        DAILY,
        WEEKLY
    }

    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    private LocalDateTime lastSentAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
