from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, UserSerializer,
    CustomTokenObtainPairSerializer, ChangePasswordSerializer
)
from .permissions import IsAdmin
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

from .throttles import LoginRateThrottle
class RegisterView(generics.CreateAPIView):
    """Inscription client (public)"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(TokenObtainPairView):
    """Login → retourne access + refresh + user info"""

    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]  # ✅ must be inside the class

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)

        except TokenError as e:
            raise InvalidToken(e.args[0])

        except Exception:
            return Response(
                {'detail': 'Email ou mot de passe incorrect. Veuillez réessayer.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class MeView(generics.RetrieveUpdateAPIView):
    """Voir / modifier son propre profil — toujours partial"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)



class ChangePasswordView(APIView):
    """Changer mot de passe + révoquer tokens"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            user = request.user

            # 1. Change password
            user.set_password(serializer.validated_data['new_password'])
            user.save()

            # 2. Revoke refresh token (IMPORTANT FIX)
            refresh_token = request.data.get("refresh")

            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception:
                    pass

            return Response({
                "message": "Mot de passe modifié avec succès. Sessions invalidées."
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(generics.ListAPIView):
    """Admin: liste de tous les utilisateurs"""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        role = self.request.query_params.get('role')
        qs = User.objects.all().order_by('-date_joined')
        if role:
            qs = qs.filter(role=role)
        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: voir/modifier/supprimer un utilisateur"""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all()


class CreateCoachView(generics.CreateAPIView):
    """Admin: créer un compte coach"""
    serializer_class = RegisterSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        serializer.save(role='coach')