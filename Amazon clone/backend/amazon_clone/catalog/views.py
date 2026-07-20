from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer


class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.filter(status='active').order_by('-created_at')
        # optional filters
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category__iexact=cat)
        q = self.request.query_params.get('q')
        if q:
            qs = qs.filter(name__icontains=q)
        return qs


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductSerializer
    queryset = Product.objects.all()


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        data = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Beauty', 'Gaming', 'Sports', 'Toys']
        return Response({'results': data})
