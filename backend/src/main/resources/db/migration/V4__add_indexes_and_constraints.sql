-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_level ON jobs(level);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);

-- Add CHECK constraints for data integrity
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('CANDIDATE', 'RECRUITER', 'ADMIN'));

ALTER TABLE jobs ADD CONSTRAINT chk_jobs_job_type CHECK (job_type IN ('FULLTIME', 'PARTTIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'));
ALTER TABLE jobs ADD CONSTRAINT chk_jobs_level CHECK (level IN ('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'));
ALTER TABLE jobs ADD CONSTRAINT chk_jobs_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'DRAFT'));
ALTER TABLE jobs ADD CONSTRAINT chk_jobs_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);

ALTER TABLE applications ADD CONSTRAINT chk_applications_status CHECK (status IN ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'));

ALTER TABLE companies ADD CONSTRAINT chk_companies_size CHECK (size IS NULL OR size IN ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'));

-- Add composite index for common job feed queries
CREATE INDEX IF NOT EXISTS idx_jobs_feed ON jobs(status, created_at DESC);

-- Add index for full-text search on jobs
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
