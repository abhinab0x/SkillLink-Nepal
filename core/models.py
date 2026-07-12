from django.db import models


class Location(models.Model):
    location_id = models.AutoField(primary_key=True)
    district = models.CharField(max_length=100)
    province = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'location'
        unique_together = (('district', 'province'),)

    def __str__(self):
        return f"{self.district}, {self.province}"


class AppUser(models.Model):
    ROLE_CHOICES = (
        ('seeker', 'Job Seeker'),
        ('employer', 'Employer'),
    )

    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True,
        db_column='location_id', related_name='users'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'app_user'

    def __str__(self):
        return self.username


class JobSeekerProfile(models.Model):
    user = models.OneToOneField(
        AppUser, on_delete=models.CASCADE,
        primary_key=True, db_column='user_id', related_name='jobseeker_profile'
    )
    bio = models.TextField(blank=True, null=True)
    years_experience = models.IntegerField(default=0)

    class Meta:
        managed = False
        db_table = 'jobseeker_profile'

    def __str__(self):
        return f"Seeker: {self.user.username}"


class EmployerProfile(models.Model):
    user = models.OneToOneField(
        AppUser, on_delete=models.CASCADE,
        primary_key=True, db_column='user_id', related_name='employer_profile'
    )
    company_name = models.CharField(max_length=150)
    company_description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'employer_profile'

    def __str__(self):
        return self.company_name


class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True)
    skill_name = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = False
        db_table = 'skill'

    def __str__(self):
        return self.skill_name


class CandidateSkill(models.Model):
    PROFICIENCY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert'),
    )

    user = models.ForeignKey(
        JobSeekerProfile, on_delete=models.CASCADE,
        db_column='user_id', related_name='candidate_skills'
    )
    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE,
        db_column='skill_id', related_name='candidate_skills'
    )
    proficiency_level = models.CharField(max_length=15, choices=PROFICIENCY_CHOICES)

    class Meta:
        managed = False
        db_table = 'candidate_skill'
        unique_together = (('user', 'skill'),)

    def __str__(self):
        return f"{self.user.user_id} - {self.skill.skill_name}"


class Job(models.Model):
    job_id = models.AutoField(primary_key=True)
    employer = models.ForeignKey(
        EmployerProfile, on_delete=models.CASCADE,
        db_column='employer_id', related_name='jobs'
    )
    location = models.ForeignKey(
        Location, on_delete=models.SET_NULL, null=True,
        db_column='location_id', related_name='jobs'
    )
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'job'

    def __str__(self):
        return self.title


class JobRequiredSkill(models.Model):
    IMPORTANCE_CHOICES = (
        ('required', 'Required'),
        ('preferred', 'Preferred'),
    )

    job = models.ForeignKey(
        Job, on_delete=models.CASCADE,
        db_column='job_id', related_name='required_skills'
    )
    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE,
        db_column='skill_id', related_name='required_for_jobs'
    )
    importance = models.CharField(max_length=10, choices=IMPORTANCE_CHOICES)

    class Meta:
        managed = False
        db_table = 'job_required_skill'
        unique_together = (('job', 'skill'),)

    def __str__(self):
        return f"{self.job.title} needs {self.skill.skill_name}"


class Application(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired'),
    )

    application_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        JobSeekerProfile, on_delete=models.CASCADE,
        db_column='user_id', related_name='applications'
    )
    job = models.ForeignKey(
        Job, on_delete=models.CASCADE,
        db_column='job_id', related_name='applications'
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'application'
        unique_together = (('user', 'job'),)

    def __str__(self):
        return f"{self.user.user_id} -> {self.job.title} ({self.status})"