from rest_framework import serializers
from core.models import (
    Location, AppUser, JobSeekerProfile, EmployerProfile,
    Skill, CandidateSkill, Job, JobRequiredSkill, Application
)


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['location_id', 'district', 'province']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['skill_id', 'skill_name']


class AppUserSerializer(serializers.ModelSerializer):
    location_detail = LocationSerializer(source='location', read_only=True)

    class Meta:
        model = AppUser
        fields = ['user_id', 'username', 'email', 'password', 'role',
                  'location', 'location_detail', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    user_detail = AppUserSerializer(source='user', read_only=True)

    class Meta:
        model = JobSeekerProfile
        fields = ['user', 'user_detail', 'bio', 'years_experience']


class EmployerProfileSerializer(serializers.ModelSerializer):
    user_detail = AppUserSerializer(source='user', read_only=True)

    class Meta:
        model = EmployerProfile
        fields = ['user', 'user_detail', 'company_name', 'company_description']


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill_detail = SkillSerializer(source='skill', read_only=True)

    class Meta:
        model = CandidateSkill
        fields = ['id', 'user', 'skill', 'skill_detail', 'proficiency_level']


class JobRequiredSkillSerializer(serializers.ModelSerializer):
    skill_detail = SkillSerializer(source='skill', read_only=True)

    class Meta:
        model = JobRequiredSkill
        fields = ['id', 'job', 'skill', 'skill_detail', 'importance']


class JobSerializer(serializers.ModelSerializer):
    location_detail = LocationSerializer(source='location', read_only=True)
    employer_detail = EmployerProfileSerializer(source='employer', read_only=True)
    required_skills = JobRequiredSkillSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = ['job_id', 'employer', 'employer_detail', 'location', 'location_detail',
                  'title', 'description', 'salary_min', 'salary_max',
                  'is_active', 'posted_at', 'required_skills']


class ApplicationSerializer(serializers.ModelSerializer):
    job_detail = JobSerializer(source='job', read_only=True)
    candidate_detail = JobSeekerProfileSerializer(source='user', read_only=True)

    class Meta:
        model = Application
        fields = ['application_id', 'user', 'job', 'job_detail', 'candidate_detail', 'status', 'applied_at']