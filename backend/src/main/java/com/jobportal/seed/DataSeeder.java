package com.jobportal.seed;

import com.jobportal.application.entity.Application;
import com.jobportal.application.entity.ApplicationStatus;
import com.jobportal.application.repository.ApplicationRepository;
import com.jobportal.candidate.entity.CandidateProfile;
import com.jobportal.candidate.repository.CandidateProfileRepository;
import com.jobportal.company.entity.Company;
import com.jobportal.company.entity.CompanySize;
import com.jobportal.company.entity.RecruiterProfile;
import com.jobportal.company.repository.CompanyRepository;
import com.jobportal.company.repository.RecruiterProfileRepository;
import com.jobportal.job.entity.*;
import com.jobportal.job.repository.JobRepository;
import com.jobportal.user.entity.Role;
import com.jobportal.user.entity.User;
import com.jobportal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker();

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has data, skipping seed");
            return;
        }

        log.info("Seeding database with demo data...");
        seedData();
        log.info("Database seeded successfully");
    }

    private void seedData() {
        User admin = createUser("admin@jobportal.com", generateSecurePassword(), Role.ADMIN);

        List<User> recruiters = new ArrayList<>();
        List<Company> companies = new ArrayList<>();

        for (int i = 0; i < 10; i++) {
            User recruiter = createUser(
                    faker.internet().emailAddress(),
                    generateSecurePassword(),
                    Role.RECRUITER
            );
            recruiters.add(recruiter);

            Company company = new Company();
            company.setName(faker.company().name());
            company.setWebsite(faker.internet().url());
            company.setDescription(faker.lorem().paragraph(3));
            company.setSize(CompanySize.values()[faker.random().nextInt(CompanySize.values().length)]);
            company.setIndustry(faker.lorem().word());
            company.setLocation(faker.address().city() + ", " + faker.address().country());
            company.setVerified(faker.bool().bool());
            company = companyRepository.save(company);
            companies.add(company);

            RecruiterProfile rp = new RecruiterProfile();
            rp.setUser(recruiter);
            rp.setFullName(faker.name().fullName());
            rp.setPosition(faker.job().position());
            rp.setCompany(company);
            recruiterProfileRepository.save(rp);
        }

        List<User> candidates = new ArrayList<>();
        List<String> allSkills = Arrays.asList("Java", "Spring Boot", "React", "TypeScript", "Python", "Node.js",
                "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "GraphQL", "REST", "Git", "Agile",
                "Microservices", "CI/CD", "Redis", "Kafka", "Elasticsearch");

        for (int i = 0; i < 30; i++) {
            User candidate = createUser(
                    faker.internet().emailAddress(),
                    generateSecurePassword(),
                    Role.CANDIDATE
            );
            candidates.add(candidate);

            int numSkills = faker.random().nextInt(3, 8);
            List<String> skills = new HashSet<>(allSkills).stream()
                    .sorted((a, b) -> faker.random().nextInt(0, 100) - faker.random().nextInt(0, 100))
                    .limit(numSkills)
                    .toList();

            List<Map<String, Object>> experience = new ArrayList<>();
            int expCount = faker.random().nextInt(1, 4);
            for (int j = 0; j < expCount; j++) {
                Map<String, Object> exp = new LinkedHashMap<>();
                exp.put("title", faker.job().title());
                exp.put("company", faker.company().name());
                exp.put("period", faker.random().nextInt(2018, 2025) + " - " + (faker.bool().bool() ? "Present" : faker.random().nextInt(2019, 2025)));
                exp.put("description", faker.lorem().paragraph(2));
                experience.add(exp);
            }

            CandidateProfile profile = new CandidateProfile();
            profile.setUser(candidate);
            profile.setFullName(faker.name().fullName());
            profile.setHeadline(faker.job().keySkills());
            profile.setBio(faker.lorem().paragraph(3));
            profile.setLocation(faker.address().city() + ", " + faker.address().country());
            profile.setSalaryExpectation(faker.random().nextInt(50000, 150000));
            profile.setCurrency("USD");
            profile.setSkills(skills);
            profile.setExperience(experience);
            profile.setRemote(faker.bool().bool());
            candidateProfileRepository.save(profile);
        }

        List<Job> jobs = new ArrayList<>();
        String[] jobTitles = {"Software Engineer", "Senior Developer", "Full Stack Developer", "Backend Engineer",
                "Frontend Developer", "DevOps Engineer", "Data Engineer", "Tech Lead", "Product Manager",
                "UI/UX Designer", "QA Engineer", "Solutions Architect", "Cloud Engineer", "Mobile Developer"};

        for (int i = 0; i < 50; i++) {
            Company company = companies.get(faker.random().nextInt(companies.size()));
            User recruiter = recruiters.get(faker.random().nextInt(recruiters.size()));

            Job job = new Job();
            job.setCompany(company);
            job.setRecruiter(recruiter);
            job.setTitle(jobTitles[faker.random().nextInt(jobTitles.length)]);
            job.setDescription(faker.lorem().paragraph(5));
            job.setRequirements(Arrays.asList(faker.lorem().sentence(), faker.lorem().sentence(), faker.lorem().sentence()));
            job.setBenefits(Arrays.asList(faker.lorem().sentence(), faker.lorem().sentence()));
            job.setJobType(JobType.values()[faker.random().nextInt(JobType.values().length)]);
            job.setLevel(JobLevel.values()[faker.random().nextInt(JobLevel.values().length)]);
            job.setLocation(faker.address().city() + ", " + faker.address().country());
            job.setRemote(faker.bool().bool());
            job.setHybrid(faker.bool().bool());
            job.setSalaryMin(faker.random().nextInt(60000, 100000));
            job.setSalaryMax(faker.random().nextInt(100000, 180000));
            job.setCurrency("USD");
            job.setStatus(JobStatus.ACTIVE);
            job.setExpiresAt(LocalDateTime.now().plusDays(faker.random().nextInt(30, 90)));
            job.setViewCount((long) faker.random().nextInt(0, 500));
            job.setApplicationCount(0L);
            job = jobRepository.save(job);
            jobs.add(job);
        }

        for (int i = 0; i < 100; i++) {
            User candidate = candidates.get(faker.random().nextInt(candidates.size()));
            Job job = jobs.get(faker.random().nextInt(jobs.size()));

            if (applicationRepository.existsByCandidateIdAndJobId(candidate.getId(), job.getId())) {
                continue;
            }

            ApplicationStatus[] statuses = ApplicationStatus.values();
            ApplicationStatus status = statuses[faker.random().nextInt(statuses.length)];

            Application application = new Application();
            application.setJob(job);
            application.setCandidate(candidate);
            application.setCoverLetter(faker.lorem().paragraph(2));
            application.setStatus(status);
            application.setPipelineStage(status.ordinal());
            application.setAppliedAt(LocalDateTime.now().minusDays(faker.random().nextInt(1, 60)));
            applicationRepository.save(application);
        }
    }

    private User createUser(String email, String password, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private String generateSecurePassword() {
        return faker.internet().password(12, 20, true, true, true);
    }
}
