from django.utils.text import slugify
from django.db.models import Q
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Category, Product, Banner
from sellers.models import Seller
from core.permissions import IsSuperAdminUser
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductListSerializer,
    BannerSerializer,
    ProductCreateSerializer,
)


class CategoryList(APIView):
    def get(self, request):
        categories = Category.objects.all()
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
        query = Product.objects.filter(is_active=True, is_flagged=False)

        verified_ids = list(Seller.objects.filter(status='verified', is_flagged=False).values_list('id', flat=True))
        query = query.filter(Q(seller=None) | Q(seller_id__in=verified_ids))

        category = request.query_params.get('category')
        if category:
            query = query.filter(category__slug=category)

        is_featured = request.query_params.get('is_featured')
        if is_featured and is_featured.lower() == 'true':
            query = query.filter(is_featured=True)

        search = request.query_params.get('search')
        if search:
            query = query.filter(name__icontains=search)

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
            category = Category.objects.filter(name=category_name).first()
            if not category:
                category = Category(name=category_name, slug=category_slug)
                category.save()

        if not validated.get('slug'):
            base_slug = slugify(validated['name'])
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated['slug'] = slug

        product = Product(category=category, **validated)
        try:
            product.save()
        except Exception:
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


class ProductDetailById(APIView):
    """Same storefront gating as ProductList — used by the product detail page since the frontend links by id, not slug."""
    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id, is_active=True, is_flagged=False)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if product.seller and (product.seller.status != 'verified' or product.seller.is_flagged):
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(ProductSerializer(product).data)


class FeaturedProducts(APIView):
    def get(self, request):
        products = Product.objects.filter(is_active=True, is_featured=True)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class SearchSuggestions(APIView):
    def get(self, request):
        term = (request.query_params.get('q') or '').strip()
        if not term:
            return Response({'matches': [], 'related': [], 'related_category': None})

        verified_ids = list(Seller.objects.filter(status='verified', is_flagged=False).values_list('id', flat=True))
        base = Product.objects.filter(is_active=True, is_flagged=False).filter(Q(seller=None) | Q(seller_id__in=verified_ids))

        matches = list(base.filter(name__icontains=term)[:6])

        if not matches:
            categories = Category.objects.all()
            category_hit = next(
                (c for c in categories
                 if term.lower() in c.name.lower() or c.name.lower() in term.lower()),
                None,
            )
            if category_hit:
                related = list(base.filter(category=category_hit)[:6])
                return Response({
                    'matches': [],
                    'related': ProductListSerializer(related, many=True).data,
                    'related_category': category_hit.name,
                })
            return Response({'matches': [], 'related': [], 'related_category': None})

        matched_categories = {p.category_id for p in matches if p.category_id}
        matched_ids = {p.id for p in matches}
        related = [
            p for p in base.filter(category_id__in=list(matched_categories))
            if p.id not in matched_ids
        ][:6]

        related_category_name = matches[0].category.name if matches[0].category else None

        return Response({
            'matches': ProductListSerializer(matches, many=True).data,
            'related': ProductListSerializer(related, many=True).data,
            'related_category': related_category_name,
        })


# ---------------------------------------------------------------------------
# Admin: browse + flag any product.  SuperAdmin: permanently remove one.
# ---------------------------------------------------------------------------

class AdminProductListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        query = Product.objects.all()
        flagged_only = request.query_params.get('flagged')
        if flagged_only == 'true':
            query = query.filter(is_flagged=True)
        query = query.order_by('-created_at')
        return Response(ProductListSerializer(query, many=True).data)


class AdminProductFlagView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, product_id):
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.is_flagged = True
        product.flag_reason = request.data.get('reason', '')
        product.save()
        return Response(ProductSerializer(product).data)


class AdminProductUnflagView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, product_id):
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.is_flagged = False
        product.flag_reason = ''
        product.save()
        return Response(ProductSerializer(product).data)


class SuperAdminProductRemoveView(APIView):
    permission_classes = [IsSuperAdminUser]

    def delete(self, request, product_id):
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BannerList(APIView):
    def get(self, request):
        banners = Banner.objects.filter(is_active=True).order_by('order')
        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data)