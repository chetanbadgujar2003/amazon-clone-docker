from django.utils.text import slugify
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from mongoengine.errors import NotUniqueError
from .models import Category, Product, Banner
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductListSerializer,
    BannerSerializer,
    ProductCreateSerializer,
)


class CategoryList(APIView):
    def get(self, request):
        categories = Category.objects()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class CategoryDetail(APIView):
    def get(self, request, slug):
        try:
            category = Category.objects.get(slug=slug)
            serializer = CategorySerializer(category)
            return Response(serializer.data)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductList(APIView):
    def get(self, request):
        query = Product.objects(is_active=True)
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            query = query(category__slug=category)
        
        # Filter by featured
        is_featured = request.query_params.get('is_featured')
        if is_featured and is_featured.lower() == 'true':
            query = query(is_featured=True)
        
        # Search
        search = request.query_params.get('search')
        if search:
            query = query(name__icontains=search)
        
        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        query = query.order_by(ordering)
        
        serializer = ProductListSerializer(query, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        category_name = validated.pop('category', None)
        category = None
        if category_name:
            category_slug = slugify(category_name)
            category = Category.objects(name=category_name).first()
            if not category:
                category = Category(
                    name=category_name,
                    slug=category_slug,
                )
                category.save()

        if not validated.get('slug'):
            base_slug = slugify(validated['name'])
            slug = base_slug
            counter = 1
            while Product.objects(slug=slug).first() is not None:
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated['slug'] = slug

        product = Product(
            category=category,
            **validated,
        )
        try:
            product.save()
        except NotUniqueError as e:
            return Response(
                {'detail': 'Product slug conflict, please retry with a unique title.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetail(APIView):
    def get(self, request, slug):
        try:
            product = Product.objects.get(slug=slug, is_active=True)
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)


class FeaturedProducts(APIView):
    def get(self, request):
        products = Product.objects(is_active=True, is_featured=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class BannerList(APIView):
    def get(self, request):
        banners = Banner.objects(is_active=True).order_by('order')
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)