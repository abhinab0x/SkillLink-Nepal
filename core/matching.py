from core.models import Job, JobSeekerProfile, CandidateSkill, JobRequiredSkill

PROFICIENCY_WEIGHT = {
    'beginner': 1,
    'intermediate': 2,
    'expert': 3,
}

REQUIRED_MULTIPLIER = 3
PREFERRED_MULTIPLIER = 1
LOCATION_BONUS = 5


def calculate_match(seeker_profile: JobSeekerProfile, job: Job) -> dict:
    """
    Computes a match score between one candidate and one job.
    Returns a dict with the raw score, percentage, and skill breakdown -
    used both for ranking and for showing the user WHY they matched.
    """
    # Build a lookup of the candidate's skills: {skill_id: proficiency_level}
    candidate_skills = {
        cs.skill_id: cs.proficiency_level
        for cs in CandidateSkill.objects.filter(user=seeker_profile)
    }

    required_skills = JobRequiredSkill.objects.filter(job=job, importance='required')
    preferred_skills = JobRequiredSkill.objects.filter(job=job, importance='preferred')

    score = 0
    matched_required = []
    missing_required = []
    matched_preferred = []

    for req in required_skills:
        if req.skill_id in candidate_skills:
            proficiency = candidate_skills[req.skill_id]
            score += PROFICIENCY_WEIGHT[proficiency] * REQUIRED_MULTIPLIER
            matched_required.append(req.skill.skill_name)
        else:
            missing_required.append(req.skill.skill_name)

    for pref in preferred_skills:
        if pref.skill_id in candidate_skills:
            proficiency = candidate_skills[pref.skill_id]
            score += PROFICIENCY_WEIGHT[proficiency] * PREFERRED_MULTIPLIER
            matched_preferred.append(pref.skill.skill_name)

    # Location bonus
    same_location = (
        seeker_profile.user.location_id is not None
        and job.location_id is not None
        and seeker_profile.user.location_id == job.location_id
    )
    if same_location:
        score += LOCATION_BONUS

    total_required = required_skills.count()
    match_percentage = (
        round((len(matched_required) / total_required) * 100, 1)
        if total_required > 0 else 0
    )

    return {
        'job_id': job.job_id,
        'job_title': job.title,
        'match_score': score,
        'match_percentage': match_percentage,
        'matched_required_skills': matched_required,
        'missing_required_skills': missing_required,
        'matched_preferred_skills': matched_preferred,
        'same_location': same_location,
    }


def recommend_jobs_for_candidate(seeker_profile: JobSeekerProfile, min_score=1):
    """
    Runs the match algorithm against every active job and returns
    them ranked by score, highest first.
    """
    active_jobs = Job.objects.filter(is_active=True)
    results = [calculate_match(seeker_profile, job) for job in active_jobs]
    results = [r for r in results if r['match_score'] >= min_score]
    results.sort(key=lambda r: r['match_score'], reverse=True)
    return results


def recommend_candidates_for_job(job: Job, min_score=1):
    """
    Runs the match algorithm against every candidate and returns
    them ranked by score, highest first - used by employers.
    """
    all_seekers = JobSeekerProfile.objects.all()
    results = []
    for seeker in all_seekers:
        match = calculate_match(seeker, job)
        match['user_id'] = seeker.user_id
        match['candidate_username'] = seeker.user.username
        results.append(match)
    results = [r for r in results if r['match_score'] >= min_score]
    results.sort(key=lambda r: r['match_score'], reverse=True)
    return results