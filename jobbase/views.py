from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta

import json
import stripe
import re
import os

from .models import *

from .forms import CVForm
from recruitment.settings import BASE_DIR


YOUR_DOMAIN = 'https://jobbase.herokuapp.com'
# This is your test secret API key.
stripe.api_key = 'sk_test_51LyumzJDuT7kCtc6Fzg2NCJPRwDpx9mVApdtih5ADgdluK6C1LMr71INGC6G1zzg0IpTaNcUonzQuXkDiWK5nmf7004742kG9K'

# This is your Stripe CLI webhook secret for testing your endpoint locally.
endpoint_secret = 'whsec_aadba8d51ec453d2c6b5e6f396fef3c2b220d24204530fcdaff877cd90fd3787'


def index(request):

    if request.method == "POST":
        form = CVForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            # Get application from DB and append new CV to it
            application = Applications.objects.get(id=int(request.POST['applicationID']))
            application.cv = CV.objects.get(id=form.instance.id)
            application.save()

    else:
        form = CVForm()

    return render(request, "jobbase/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "jobbase/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "jobbase/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        status = request.POST["status"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "jobbase/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            if status == 'Employer':
                user = User.objects.create_user(username, email, password, employer=True)
                user.save()
            else:
                user = User.objects.create_user(username, email, password)
                user.save()
        except IntegrityError:
            return render(request, "jobbase/register.html", {
                "message": "This username has been already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "jobbase/register.html")


def check_login(request):

    username = False
    signed_in = False
    if request.user.is_authenticated:
        signed_in = True
        username = request.user.username

    return JsonResponse([signed_in, username], safe=False)
 
def first_login(request):

    if request.user.is_authenticated:
        # Create bool to pass in whether the user is an employer or job seeker
        employer = False 

        # Check if the user has a profile
        user = User.objects.get(username=request.user.username)
        
        if not user.employer:
            # Check for an existing profile
            profile = profileSeeker.objects.filter(user=user)
            return JsonResponse([len(profile), employer], safe=False)
        else:
            employer = True
            profile = profileEmployer.objects.filter(user=user)
            return JsonResponse([len(profile), employer], safe=False)

@login_required
def profile(request):

    # Get current user
    user = User.objects.get(username=request.user.username)

    if request.method == "POST":
        # Get data
        data = json.loads(request.body)

        if data['employer'] == True:
            # Create new Profiel and save
            newProfile = profileEmployer(
                user=user, companyName=data['companyName'], personName=data['personName'], 
                foundationYear=data['foundationYear'], companySize=data['companySize'], 
                headquatersLocation=data['headquatersLocation'], website=data['website']
                )

            newProfile.save()
        
        else:

            newProfile = profileSeeker(user=user, name=data['name'], location=data['location'])
            newProfile.save()

        return HttpResponse(status=200)

    if request.method == "GET":

        # Set Bool for validation
        employer = False

        # Validate if current user is an employer or job seeker
        if user.employer:
            employer = True

        return JsonResponse(employer, safe=False)

    if request.method == "PUT":
    
        # Get data
        data = json.loads(request.body)

        if data['employer'] == True and user.employer == True:
            # Get profile
            profile = profileEmployer.objects.get(user=user)

            # Change Profile data and save
            profile.companyName = data['companyName']
            profile.personName = data['personName']
            profile.foundationYear = data['foundationYear']
            profile.companySize = data['companySize']
            profile.headquatersLocation = data['headquatersLocation']
            profile.website = data['website']

            profile.save()

            return HttpResponse(status=200)

        else:
            # Get profile
            profile = profileSeeker.objects.get(user=user)

            profile.name = data['name'] 
            profile.location = data['location'] 

            profile.save()

            return HttpResponse(status=200)


@login_required
def fetchProfile(request):
    
    # Check if user is authenticated and an employer then return profile data
    try:
        if request.user.is_authenticated and request.user.employer:
            profile = profileEmployer.objects.get(user=User.objects.get(username=request.user.username))
            return JsonResponse(profile.serialize(), safe=False)
        
        elif request.user.is_authenticated:
            profile = profileSeeker.objects.get(user=User.objects.get(username=request.user.username))
            return JsonResponse(profile.serialize(), safe=False)
        
        else:
            return HttpResponse(status=404)
    
    except:
        ValueError

    return(HttpResponse(status=401))

def statusCheck(request):
    
    # Check if user is logged in as Employer, Jobseeker or NOT logged in
    if request.user.is_authenticated and request.user.employer:
        responseDic = {'employer': True}
        print('TRUE')
        return JsonResponse(responseDic, safe=False)
    elif request.user.is_authenticated:
        responseDic = {'employer': False}
        print('FALSE')
        return JsonResponse(responseDic, safe=False)
    else:
        responseDic = {'employer': 'None'}
        print('NONE')
        return JsonResponse(responseDic, safe=False)



@login_required
def apply(request):

    # Get current user
    user = User.objects.get(username=request.user.username)

    if request.method == "GET":
        profile = profileSeeker.objects.get(user=user)
        profile = profile.serialize()
        profile['email'] = user.email
        return JsonResponse(profile, safe=False)

    if request.method == "POST":
        # Get data from post request
        data = json.loads(request.body)

        # Get user profile, the job Post
        profile = profileSeeker.objects.get(user=user)
        post = jobPost.objects.get(id=int(data['postID']))

        # Check if the user already applied for this job
        if (len(Applications.objects.filter(candidate=profile, jobpost=post)) != 0):
            return HttpResponse(status=400)

        if data['cvID'] != 'None':
 
            cv = CV.objects.get(id=data['cvID'])
            # Create application object
            new = Applications(candidate=profile, jobpost=post, coverLetter=data['coverLetter'], cv=cv)
            new.save()
            return HttpResponse(status=200)

        else:
            # Create application object
            new = Applications(candidate=profile, jobpost=post, coverLetter=data['coverLetter'])
            new.save()

            return JsonResponse(new.id, safe=False)

        


@login_required
def create_checkout_session(request, id):

    # Get current user
    user = User.objects.get(username=request.user.username)
    if len(jobPost.objects.filter(id=id, user=user)) == 0:
        return HttpResponse(status=401)

    else:
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    'price': 'price_1MIL9AJDuT7kCtc6Civuh4IN',
                    'quantity': 1,
                },
            ],
            mode='payment',
            client_reference_id = id,
            success_url=YOUR_DOMAIN + '/mypage',
            cancel_url=YOUR_DOMAIN + '/mypage',
        )

        return redirect(checkout_session.url, code=303)


@login_required
def editProfile(request):

    # Get current user
    user = User.objects.get(username=request.user.username)

    # Get CV if there is one
    cv = CV.objects.filter(user=user, active=True)
    hasActiveCV = False
    if len(cv) != 0:
        hasActiveCV = True
        cv = cv[0]
        print(cv.id)
    else:
        cv.cv = False

    if request.method == "POST":
    
        form = CVForm(request.POST, request.FILES)

        if form.is_valid():
            form.save()
            if hasActiveCV:
                cv.active = False
                cv.save()

            CVupload = form.instance
            return render(request, "jobbase/profile.html", {"CVupload": CVupload})
    
    else:
        form = CVForm()

    return render(request, "jobbase/profile.html", {"CVcurrent": cv.cv})


@login_required
def applicationCVProcess(request):

    # Get current user
    user = User.objects.get(username=request.user.username)
    # Get users CV
    cv = CV.objects.filter(user=user, active=True)
    hasCV = False
    if len(cv) != 0:
        hasCV = True
        cv = cv[0]

    if request.method == "GET":
        if hasCV == False:
            return JsonResponse(hasCV, safe=False)

        name = str(cv.cv.name)
        cvData = {
            "url": str(cv.cv.url),
            "name": name[9:],
            "id": cv.id
        }

        return JsonResponse(cvData, safe=False)

    if request.method == "POST":
        form = CVForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            if hasCV:
                os.remove(cv.cv.path)
                cv.delete()

            return HttpResponse(status=200)


@login_required
def mypage(request):
    return render(request, "jobbase/mypage.html")

@login_required
def postJob(request):

    # Get user input
    input = json.loads(request.body)

    # Get current user
    user = User.objects.get(username=request.user.username)

    if user.employer:

        # Get company name
        profile = profileEmployer.objects.get(user=user)

        # Get todays date and create a day for expiry of post
        today = datetime.today()
        one_duration = today + timedelta(days=60)

        # Create Inactive DB entry
        new = jobPost(
            user=user, companyName=profile.companyName, active=False,
            title=input['title'], location=input['location'], positionType=input['positionType'],
            annualy=input['annualy'], hourly=input['hourly'], employmentType=input['jobType'], 
            jobDescription=input['jobDescription'], date=today.strftime('%Y-%m-%d'), expiry=one_duration.strftime('%Y-%m-%d'),
            website=profile.website)
        
        new.save()

    return JsonResponse(new.id, safe=False)


@csrf_exempt
def webhook(request):
    event = None
    payload = request.body
    sig_header = request.headers['STRIPE_SIGNATURE']
    print('THIS WAS REQUESTED')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        raise e
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise e
    print("UNTIL HERE")
    # Handle the event
    if event['type'] == 'checkout.session.completed':
        charge = event['data']['object']

        # Get todays date and create a day for expiry of post
        today = datetime.today()
        one_duration = today + timedelta(days=60)
        
        print("EXECUTE A")
        print(f"EXECUTE B {charge['client_reference_id']}")
        # Set the Post to active and reassign dates in case this post is being reactivated
        post = jobPost.objects.get(id=int(charge['client_reference_id']))
        post.active = True
        post.date = today.strftime('%Y-%m-%d')
        post.expiry = one_duration.strftime('%Y-%m-%d')
        post.save()
        print(f"EXECUTE C {post}")
        
    # ... handle other event types


    else:
      print('Unhandled event type {}'.format(event['type']))

    success=True
    return JsonResponse(success, safe=False)

def expiryCheck(request):

    # Get current date 
    today = datetime.today()
    today = today.strftime('%Y-%m-%d')

    # Check database for expired jobs and deactivate them
    allPosts = jobPost.objects.filter(active=True)
    for post in allPosts:
        if str(post.expiry) == today:
            post.active = False
            post.save()

    return HttpResponse(status=200)

@login_required
def myListings(request):

    # Get current user
    user = User.objects.get(username=request.user.username)

    # Get users Posts
    allPosts = jobPost.objects.filter(user=user)

    return JsonResponse([post.serialize() for post in allPosts], safe=False)

@login_required
def myjobs(request):

    # Check if user is an Employer or Job Seeker
    try:
        if not User.objects.get(username=request.user.username).employer:
            user = User.objects.get(username=request.user.username)
            applications = Applications.objects.filter(candidate=profileSeeker.objects.get(user=user))
            return JsonResponse([application.jobpost.serialize() for application in applications], safe=False)
        
        else:
            return HttpResponse(status=401)
    except:
        ValueError


def allPosts(request, what, where):

    # Fetch all active Posts
    allposts = jobPost.objects.filter(active=True)
    
    if what == 'all' and where == 'all':
        return JsonResponse([post.serialize() for post in allposts], safe=False)
    
    else:

        match_list1 = []
        match_list2 = []

        # What Job search
        if what != 'all':
            what = re.compile(what.upper())
            for post in allposts:
                counter = 0
                matches = what.finditer(post.title.upper())
                for match in matches:
                    counter += 1
                    if counter == 1:
                        match_list1.append(post)
        
        else: 
            match_list1 = allposts
        
        if where != 'all':
            where = re.compile(where.upper())
            for post in match_list1:
                counter = 0
                matches = where.finditer(post.location.upper())
                for match in matches:
                    counter += 1
                    if counter == 1:
                        match_list2.append(post)
        
        else:
            match_list2 = match_list1
        
        return JsonResponse([post.serialize() for post in match_list2], safe=False)

@login_required
def editPost(request, id):

    # Get current user
    user = User.objects.get(username=request.user.username)

    # Get the requested Post
    post = jobPost.objects.filter(user=user, id=id)
    
    if len(post) != 1:
        return HttpResponse(status=403)

    if request.method == "GET": 
            return JsonResponse(post[0].serialize(), safe=False)
    
    if request.method == "PUT":
        # Get Data from PUT request and change post
        data = json.loads(request.body)
        post = post[0]

        post.title = data['title']
        post.positionType = data['positionType']
        post.location = data['location']
        post.annualy = data['annualy']
        post.hourly = data['hourly']
        post.jobType = data['jobType']
        post.jobDescription = data['jobDescription']
        post.save()

        return HttpResponse(status=200)


@login_required
def deactivate(request):

    if request.method == "PUT":
        # Get current user
        user = User.objects.get(username=request.user.username)

        # Get Post data from PUT reqeust
        data = json.loads(request.body)

        # Check if current user is the one who posted the job and if the job exists in DB
        jobpost = jobPost.objects.filter(id=int(data['id']), user=user)

        if len(jobpost) != 0:
            jobpost[0].active = False
            jobpost[0].save()
            return HttpResponse(status=200)
        
        return HttpResponse(status=403)


@login_required
def applicants(request, id):

    # Validate that the requesting user is the one who posted the Job
    user = User.objects.get(username=request.user.username)
    post = jobPost.objects.filter(id=id, user=user)

    if len(post) != 1:
        return HttpResponse(status=403)
    
    else:
        # If user is the one who posted the Job, fetch all applicants
        applicantions = Applications.objects.filter(jobpost=post[0])

        if len(applicantions) != 0:
            # Return serialized applicant objects
            return JsonResponse([application.serialize() for application in applicantions], safe=False)
        
        else:
            return JsonResponse(0, safe=False)


@login_required
def messageView(request):
    return render(request, "jobbase/messagepage.html")


@login_required
def message(request):

    # Get user
    user = User.objects.get(username=request.user.username)
    
    if request.method == "POST":
        # Get date and time
        today = datetime.today()
        time = today.strftime('%X')

        # Get body from Post request and save message
        body = json.loads(request.body)
        candidate = User.objects.get(id=int(body['candidateID']))
        message = Message(
            sender=user, recipient=candidate, message=body['message'], 
            date=today.strftime('%Y-%m-%d'), time=time)
        message.save()

        response = {"status": 200, "time": time}
        return JsonResponse(response, safe=False)


    if request.method == "GET":

        # Get all messages from DB  
        messagesR = Message.objects.filter(recipient=user)
        messagesS = Message.objects.filter(sender=user)

        messages = []
            
        def concatMessageData(message):
            if message.sender.employer:
                # Serialize message and update with employer profile 
                profile = profileEmployer.objects.get(user=message.sender)
                profile = profile.serialize()

                # If message sender is the current user, change ID in dictionary to user
                if (message.sender == user):
                    profile['ID'] = 'User'

                message = message.serialize()
                message.update(profile)
                # Append to messages list
                messages.append(message)
            else:
                # Get Job Seeker Profile
                profile = profileSeeker.objects.get(user=message.sender)
                profile = profile.serialize()

                # If message sender is the current user, change ID in dictionary to user
                if (message.sender == user):
                    profile['ID'] = 'User'

                message = message.serialize()
                message.update(profile)
                # Append to messages list
                messages.append(message)


        # Concatenate data
        for message in messagesR:
            concatMessageData(message)
        for message in messagesS:
            concatMessageData(message)

        # Sort function declaration
        def myFuncA(e):
            return e['date']

        def myFuncB(e):
            return e['time']
            
    
        # Sort message list after date
        messages.sort(key=myFuncA)
    

        # Sort message list after time (Not interfering with date order)
        counterA = 0
        counterB = 0

        for i in range(len(messages)):
            try:
                if counterA == 0 and messages[i + 1]['date'] != messages[i]['date']:
                    counterB = i
 
                    if counterB != counterA:
                        tmp = messages[counterA:(counterB + 1)]
                        tmp.sort(key=myFuncB)
                        messages[counterA:(counterB + 1)] = tmp
                    
                    counterA = i + 1

                if messages[i + 1]['date'] != messages[counterA]['date'] and counterA != 0:
                    counterB = i

                    tmp = messages[counterA:(counterB + 1)]
                    tmp.sort(key=myFuncB)
                    messages[counterA:(counterB + 1)] = tmp

                    counterA = i + 1

                if ((i + 1) == (len(messages) - 1) and messages[i]['date'] == messages[i + 1]['date']):
                    counterB = len(messages)

                    tmp = messages[counterA:counterB]
                    tmp.sort(key=myFuncB)
                    messages[counterA:counterB] = tmp

                
            except:
                ValueError

        tmp = []
        for message in messages:
            if message['senderID'] == user.id:
                tmp.append(message['recipientID'])

        tmp = set(tmp)
        tmp = list(tmp)
        
        for message in messages:
            for id in tmp:
                if message['senderID'] == id:
                    tmp.remove(id)

        for message in messages:
            for id in tmp:
                if message['senderID'] == user.id and message['recipientID'] == id:
                    firstMessage = {'firstMessage': True}
                    message.update(firstMessage)
                    tmp.remove(id)
        

        return JsonResponse(messages, safe=False)

