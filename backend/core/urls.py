from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/<uidb64>/<str:token>/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profiles/', views.UserProfileListView.as_view(), name='profile-list'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
