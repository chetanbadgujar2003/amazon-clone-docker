from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'items': [], 'subtotal': 0})

    def post(self, request):
        return Response({'detail': 'Item added'}, status=200)
