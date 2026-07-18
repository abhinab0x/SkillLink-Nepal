from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from core.models import (
    Location, AppUser, JobSeekerProfile, EmployerProfile,
    Skill, CandidateSkill, Job, JobRequiredSkill, Application
)
from core.serializers import (
    LocationSerializer, AppUserSerializer, JobSeekerProfileSerializer,
    EmployerProfileSerializer, SkillSerializer, CandidateSkillSerializer,
    JobSerializer, JobRequiredSkillSerializer, ApplicationSerializer
)
from core.matching import recommend_jobs_for_candidate, recommend_candidates_for_job


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


class AppUserViewSet(viewsets.ModelViewSet):
    queryset = AppUser.objects.all()
    serializer_class = AppUserSerializer


class JobSeekerProfileViewSet(viewsets.ModelViewSet):
    queryset = JobSeekerProfile.objects.all()
    serializer_class = JobSeekerProfileSerializer


class EmployerProfileViewSet(viewsets.ModelViewSet):
    queryset = EmployerProfile.objects.all()
    serializer_class = EmployerProfileSerializer


class CandidateSkillViewSet(viewsets.ModelViewSet):
    queryset = CandidateSkill.objects.all()
    serializer_class = CandidateSkillSerializer


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True).order_by('-posted_at')
    serializer_class = JobSerializer


class JobRequiredSkillViewSet(viewsets.ModelViewSet):
    queryset = JobRequiredSkill.objects.all()
    serializer_class = JobRequiredSkillSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        queryset = Application.objects.all().order_by('-applied_at')
        user_id = self.request.query_params.get('user')
        job_id = self.request.query_params.get('job')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        return queryset


@api_view(['GET'])
def recommended_jobs(request, user_id):
    """
    GET /api/seeker-profiles/<user_id>/recommended-jobs/
    Returns all active jobs ranked by match score for this candidate.
    """
    seeker_profile = get_object_or_404(JobSeekerProfile, user_id=user_id)
    results = recommend_jobs_for_candidate(seeker_profile)
    return Response(results, status=status.HTTP_200_OK)


@api_view(['GET'])
def recommended_candidates(request, job_id):
    """
    GET /api/jobs/<job_id>/recommended-candidates/
    Returns all candidates ranked by match score for this job.
    Used by employers to see their best-fit applicants/prospects.
    """
    job = get_object_or_404(Job, job_id=job_id)
    results = recommend_candidates_for_job(job)
    return Response(results, status=status.HTTP_200_OK)