from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class OrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'results': []})

    def post(self, request):
        return Response({'detail': 'Order placed'}, status=200)
