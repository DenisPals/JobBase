
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("checklogin", views.check_login, name="checklogin"),
    path("firstlogin", views.first_login, name="firstlogin"),
    path("profile", views.profile, name="profile"),
    path("create-checkout-session/<str:id>", views.create_checkout_session, name='checkout'),
    path("profileview", views.editProfile, name="profileview"),
    path("mypage", views.mypage, name="mypage"),
    path("webhook", views.webhook, name="webhook"),
    path("postjob", views.postJob, name="postjob"),
    path("mylistings", views.myListings, name="mylistings"),
    path("allposts/<str:what>/<str:where>", views.allPosts, name="allposts"),
    path("deactivate", views.deactivate, name="deactivate"),
    path("edit/<str:id>", views.editPost, name="editpost"),
    path("applicationcvprocess", views.applicationCVProcess, name="applicationcvprocess"),
    path("apply", views.apply, name="apply"),
    path("applicants/<str:id>", views.applicants, name="applicants"),
    path("messageview", views.messageView, name="messageview"),
    path("message", views.message, name="message"),
    path("myjobs", views.myjobs, name="myjobs"),
    path("getprofile", views.fetchProfile, name="getprofile"),
    path("statuscheck", views.statusCheck, name="statuscheck"),
    path("expirycheck", views.expiryCheck, name="expirycheck")
]
