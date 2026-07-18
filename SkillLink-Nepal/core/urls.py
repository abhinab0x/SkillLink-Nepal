from django.urls import path
from rest_framework.routers import DefaultRouter
from core.views import (
    LocationViewSet, SkillViewSet, AppUserViewSet, JobSeekerProfileViewSet,
    EmployerProfileViewSet, CandidateSkillViewSet, JobViewSet,
    JobRequiredSkillViewSet, ApplicationViewSet,
    recommended_jobs, recommended_candidates
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'users', AppUserViewSet)
router.register(r'seeker-profiles', JobSeekerProfileViewSet)
router.register(r'employer-profiles', EmployerProfileViewSet)
router.register(r'candidate-skills', CandidateSkillViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'job-required-skills', JobRequiredSkillViewSet)
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = router.urls + [
    path('seeker-profiles/<int:user_id>/recommended-jobs/', recommended_jobs, name='recommended-jobs'),
    path('jobs/<int:job_id>/recommended-candidates/', recommended_candidates, name='recommended-candidates'),
]