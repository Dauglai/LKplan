from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from .serializers import *
from .models import *
from .permissions import IsAuthorOrReadOnly

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Пользователь успешно зарегистрирован"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventAPIList(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)

class EventAPICreate(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)

class EventAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthorOrReadOnly,)

class EventAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (IsAuthorOrReadOnly,)

class DirectionAPIViews(viewsets.ModelViewSet):
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer
    permission_classes = (IsAuthenticated,)

class ProjectAPIViews(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = (IsAuthenticated,)    

class TeamAPIList(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)

class TeamAPICreate(generics.CreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user.profile)

class TeamAPIUpdate(generics.RetrieveUpdateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = (IsAuthorOrReadOnly,)

class TeamAPIDestroy(generics.RetrieveDestroyAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = (IsAuthorOrReadOnly,)