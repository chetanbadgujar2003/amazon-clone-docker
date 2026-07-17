from django.utils.text import slugify
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from mongoengine.errors import NotUniqueError
from .models import Category, Product, Banner, Review
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductListSerializer,
    BannerSerializer,
    ProductCreateSerializer,
    ReviewSerializer,
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

        mine = request.query_params.get('mine')
        if mine and mine.lower() == 'true':
            if not request.user.is_authenticated:
                return Response({'detail': 'Authentication is required.'}, status=status.HTTP_401_UNAUTHORIZED)
            query = query(owner_id=request.user.id)
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            query = query(category__slug=category)

        brand = request.query_params.get('brand')
        if brand:
            query = query(brand__iexact=brand)

        try:
            min_price = request.query_params.get('min_price')
            max_price = request.query_params.get('max_price')
            if min_price not in (None, ''):
                query = query(price__gte=float(min_price))
            if max_price not in (None, ''):
                query = query(price__lte=float(max_price))
        except ValueError:
            return Response({'detail': 'min_price and max_price must be valid numbers.'}, status=status.HTTP_400_BAD_REQUEST)
        
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
        allowed_ordering = {'price', '-price', 'name', '-name', 'created_at', '-created_at'}
        if ordering not in allowed_ordering:
            return Response({'detail': 'Unsupported ordering.'}, status=status.HTTP_400_BAD_REQUEST)
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
            owner_id=request.user.id if request.user.is_authenticated else None,
            owner_username=request.user.username if request.user.is_authenticated else '',
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

    def delete(self, request, slug):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication is required.'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            product = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if product.owner_id != request.user.id:
            return Response({'detail': 'You can only delete products you created.'}, status=status.HTTP_403_FORBIDDEN)

        Review.objects(product_key=slug).delete()
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductReviews(APIView):
    def get_product(self, slug):
        try:
            return Product.objects.get(slug=slug, is_active=True)
        except Product.DoesNotExist:
            return None

    def get(self, request, slug):
        product = self.get_product(slug)
        reviews = Review.objects(product_key=slug)
        return Response(ReviewSerializer(reviews, many=True).data)

    def post(self, request, slug):
        product = self.get_product(slug)

        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = Review(product_key=slug, product=product, **serializer.validated_data)
        review.save()

        if product:
            reviews = Review.objects(product_key=slug)
            product.num_reviews = reviews.count()
            product.rating = round(sum(item.rating for item in reviews) / product.num_reviews, 1)
            product.save()

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


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
