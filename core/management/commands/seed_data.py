from django.core.management.base import BaseCommand
from core.models import (
    Location, AppUser, JobSeekerProfile, EmployerProfile,
    Skill, CandidateSkill, Job, JobRequiredSkill, Application
)


class Command(BaseCommand):
    help = 'Seeds the database with sample data for SkillLink Nepal'

    def handle(self, *args, **kwargs):
        # 1. Locations
        ktm, _ = Location.objects.get_or_create(district='Kathmandu', province='Bagmati')
        pkr, _ = Location.objects.get_or_create(district='Pokhara', province='Gandaki')
        lpr, _ = Location.objects.get_or_create(district='Lalitpur', province='Bagmati')
        self.stdout.write(self.style.SUCCESS('Locations seeded'))

        # 2. Skills
        skill_names = ['Python', 'Django', 'React', 'PostgreSQL', 'Plumbing',
                        'Electrical Wiring', 'Graphic Design', 'Excel', 'Communication']
        skills = {}
        for name in skill_names:
            skill, _ = Skill.objects.get_or_create(skill_name=name)
            skills[name] = skill
        self.stdout.write(self.style.SUCCESS('Skills seeded'))

        # 3. Users - one seeker, one employer
        seeker_user, _ = AppUser.objects.get_or_create(
            username='ramesh_dev',
            defaults={
                'email': 'ramesh@example.com',
                'password': 'hashed_placeholder',
                'role': 'seeker',
                'location': ktm,
            }
        )
        seeker_profile, _ = JobSeekerProfile.objects.get_or_create(
            user=seeker_user,
            defaults={'bio': 'Aspiring backend developer', 'years_experience': 1}
        )

        employer_user, _ = AppUser.objects.get_or_create(
            username='techhub_np',
            defaults={
                'email': 'hr@techhub.com.np',
                'password': 'hashed_placeholder',
                'role': 'employer',
                'location': lpr,
            }
        )
        employer_profile, _ = EmployerProfile.objects.get_or_create(
            user=employer_user,
            defaults={'company_name': 'TechHub Nepal', 'company_description': 'A local software company'}
        )
        self.stdout.write(self.style.SUCCESS('Users and profiles seeded'))

        # 4. Candidate skills - ramesh knows Python, Django, PostgreSQL
        CandidateSkill.objects.get_or_create(
            user=seeker_profile, skill=skills['Python'],
            defaults={'proficiency_level': 'intermediate'}
        )
        CandidateSkill.objects.get_or_create(
            user=seeker_profile, skill=skills['Django'],
            defaults={'proficiency_level': 'beginner'}
        )
        CandidateSkill.objects.get_or_create(
            user=seeker_profile, skill=skills['PostgreSQL'],
            defaults={'proficiency_level': 'beginner'}
        )
        self.stdout.write(self.style.SUCCESS('Candidate skills seeded'))

        # 5. A job posted by TechHub
        job, _ = Job.objects.get_or_create(
            employer=employer_profile,
            title='Junior Backend Developer',
            defaults={
                'location': ktm,
                'description': 'Looking for a junior developer familiar with Python and Django',
                'salary_min': 30000,
                'salary_max': 45000,
                'is_active': True,
            }
        )

        # 6. Job required skills
        JobRequiredSkill.objects.get_or_create(
            job=job, skill=skills['Python'], defaults={'importance': 'required'}
        )
        JobRequiredSkill.objects.get_or_create(
            job=job, skill=skills['Django'], defaults={'importance': 'required'}
        )
        JobRequiredSkill.objects.get_or_create(
            job=job, skill=skills['PostgreSQL'], defaults={'importance': 'preferred'}
        )
        self.stdout.write(self.style.SUCCESS('Job and required skills seeded'))

        self.stdout.write(self.style.SUCCESS('Done! Sample data ready.'))