from django.contrib.auth.models import AbstractUser
from django.core.files.base import ContentFile
from django.db import models


# Model for Users
class User(AbstractUser):
    employer = models.BooleanField(default=False)


# Model for CVs
class CV(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cv = models.FileField(upload_to='cvfolder', default=None)
    active = models.BooleanField(default=False)


# Model for Job seeker profiles
class profileSeeker(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    location = models.CharField(max_length=250)

    def serialize(self):
        return {
            "ID": self.id,
            "name": self.name,
            "location": self.location
        }


# Model for Employer profiles
class profileEmployer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    companyName = models.CharField(max_length=100)
    personName = models.CharField(max_length=50)
    foundationYear = models.IntegerField()
    companySize = models.CharField(max_length=50)
    headquatersLocation = models.CharField(max_length=250)
    website = models.CharField(max_length=150, default='None')
    
    def serialize(self):
        return {
            "ID": self.id,
            "companyName": self.companyName,
            "personName": self.personName,
            "foundationYear": self.foundationYear,
            "companySize": self.companySize,
            "headquatersLocation": self.headquatersLocation,
            "website": self.website
        }


# Model for job Posts
class jobPost(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    companyName = models.CharField(max_length=100)
    active = models.BooleanField(default=True)
    title = models.CharField(max_length=100)
    location = models.CharField(max_length=250)
    positionType = models.CharField(max_length=50) # Hybrid, remote, etc.
    annualy = models.FloatField()
    hourly = models.FloatField()
    employmentType = models.CharField(max_length=50) # Full-time, part-time, etc.
    jobDescription = models.CharField(max_length=8000)
    date = models.DateField()
    expiry = models.DateField()
    website = models.CharField(max_length=150, default='None')

    def serialize(self):
        return {
            "id": self.id,
            "companyName": self.companyName,
            "active": self.active,
            "title": self.title,
            "location": self.location,
            "positionType": self.positionType,
            "annualy": self.annualy,
            "hourly": self.hourly,
            "employmentType": self.employmentType,
            "jobDescription": self.jobDescription,
            "date": self.date,
            "expiry": self.expiry,
            "website": self.website
        }


# Model for Messages
class Message(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="message_recipients")
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=2000)
    date = models.DateField()
    time = models.TimeField()

    def serialize(self):
        return {
            "recipientName": getName(self.recipient),
            "recipient": self.recipient.username,
            "recipientID": self.recipient.id,
            "senderName": getName(self.sender),
            "senderID": self.sender.id,
            "sender": self.sender.username,
            "message": self.message,
            "date": self.date,
            "time": self.time
        }

def getName(profile):
    if profile.employer:
        profile = profileEmployer.objects.get(user=User.objects.get(username=profile))
        return profile.personName
    else:
        profile = profileSeeker.objects.get(user=User.objects.get(username=profile))
        return profile.name



# Model for My Jobs (saved, applied)
class myJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(jobPost, on_delete=models.CASCADE)
    applied = models.BooleanField()
    saved = models.BooleanField()


# Model for Applications
class Applications(models.Model):
    candidate = models.ForeignKey(profileSeeker, on_delete=models.CASCADE)
    jobpost = models.ForeignKey(jobPost, on_delete=models.CASCADE)
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, blank=True, null=True)
    coverLetter = models.CharField(max_length=8000)

    def serialize(self):
        return {
            "candidate": self.candidate.user.id,
            "name": self.candidate.name,
            "location": self.candidate.location,
            "cvUrl": self.cv.cv.url,
            "coverLetter": self.coverLetter,
            "email": self.candidate.user.email,
        }
