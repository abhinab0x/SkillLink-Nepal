-- 1. LOCATION
CREATE TABLE location (
    location_id SERIAL PRIMARY KEY,
    district    VARCHAR(100) NOT NULL,
    province    VARCHAR(100) NOT NULL,
    UNIQUE (district, province)
);

-- 2. USER (base identity table, extended by Django's auth system later)
CREATE TABLE app_user (
    user_id      SERIAL PRIMARY KEY,
    username     VARCHAR(50) UNIQUE NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password     VARCHAR(255) NOT NULL,          -- stored as a hash, never plain text
    role         VARCHAR(10) NOT NULL CHECK (role IN ('seeker', 'employer')),
    contact      VARCHAR(20),
    location_id  INTEGER REFERENCES location(location_id) ON DELETE SET NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. JOB SEEKER PROFILE (1:1 with app_user, only when role = 'seeker')
CREATE TABLE jobseeker_profile (
    user_id          INTEGER PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
    bio              TEXT,
    years_experience INTEGER DEFAULT 0 CHECK (years_experience >= 0)
);

-- 4. EMPLOYER PROFILE (1:1 with app_user, only when role = 'employer')
CREATE TABLE employer_profile (
    user_id              INTEGER PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
    company_name         VARCHAR(150) NOT NULL,
    company_description  TEXT
);

-- 5. SKILL (master lookup list - prevents free-text duplication)
CREATE TABLE skill (
    skill_id    SERIAL PRIMARY KEY,
    skill_name  VARCHAR(100) UNIQUE NOT NULL
);

-- 6. CANDIDATE SKILL (junction: JobSeekerProfile <-> Skill, many-to-many)
CREATE TABLE candidate_skill (
    user_id           INTEGER REFERENCES jobseeker_profile(user_id) ON DELETE CASCADE,
    skill_id          INTEGER REFERENCES skill(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(15) NOT NULL
        CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
    PRIMARY KEY (user_id, skill_id)
);

-- 7. JOB (posted by an employer)
CREATE TABLE job (
    job_id        SERIAL PRIMARY KEY,
    employer_id   INTEGER NOT NULL REFERENCES employer_profile(user_id) ON DELETE CASCADE,
    location_id   INTEGER REFERENCES location(location_id) ON DELETE SET NULL,
    title         VARCHAR(150) NOT NULL,
    description   TEXT,
    salary_min    NUMERIC(10, 2),
    salary_max    NUMERIC(10, 2),
    contact_email VARCHAR(254),
    contact_phone VARCHAR(20),
    is_active     BOOLEAN DEFAULT TRUE,
    posted_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. JOB REQUIRED SKILL (junction: Job <-> Skill, many-to-many)
CREATE TABLE job_required_skill (
    job_id     INTEGER REFERENCES job(job_id) ON DELETE CASCADE,
    skill_id   INTEGER REFERENCES skill(skill_id) ON DELETE CASCADE,
    importance VARCHAR(10) NOT NULL
        CHECK (importance IN ('required', 'preferred')),
    PRIMARY KEY (job_id, skill_id)
);

-- 9. APPLICATION (junction with its own identity: JobSeeker <-> Job)
CREATE TABLE application (
    application_id SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES jobseeker_profile(user_id) ON DELETE CASCADE,
    job_id          INTEGER NOT NULL REFERENCES job(job_id) ON DELETE CASCADE,
    status          VARCHAR(15) NOT NULL DEFAULT 'applied'
        CHECK (status IN ('applied', 'shortlisted', 'rejected', 'hired')),
    applied_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, job_id)   -- a candidate can't apply to the same job twice
);


CREATE INDEX idx_candidate_skill_skill_id ON candidate_skill(skill_id);
CREATE INDEX idx_job_required_skill_skill_id ON job_required_skill(skill_id);
CREATE INDEX idx_job_location ON job(location_id);
CREATE INDEX idx_app_user_location ON app_user(location_id);