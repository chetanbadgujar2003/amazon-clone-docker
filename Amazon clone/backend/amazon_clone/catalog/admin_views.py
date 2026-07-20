from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .models import Product
from .serializers import ProductSerializer
from django.conf import settings
import os


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'category', 'brand']
    ordering_fields = ['price', 'created_at']

    def perform_destroy(self, instance):
        # remove media files
        try:
            if instance.main_image and os.path.exists(instance.main_image.path):
                os.remove(instance.main_image.path)
        except Exception:
            pass
        # remove additional images
        for url in instance.additional_images or []:
            try:
                rel = url.replace(settings.MEDIA_URL, '').lstrip('/')
                path = os.path.join(settings.MEDIA_ROOT, rel)
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
        instance.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        # handle uploaded main_image if present
        main = request.FILES.get('main_image')
        if main:
            # save to model's ImageField
            product.main_image.save(main.name, main, save=True)
        # handle uploaded additional images if provided as files
        add_imgs = request.FILES.getlist('additional_images')
        if add_imgs:
            for f in add_imgs:
                if f.size > 5 * 1024 * 1024:
                    continue
                product.additional_images.append(self._store_file(f, product))
            product.save()
        return Response(ProductSerializer(product, context={'request': request}).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        # handle main_image replacement
        main = request.FILES.get('main_image')
        if main:
            try:
                if product.main_image and os.path.exists(product.main_image.path):
                    os.remove(product.main_image.path)
            except Exception:
                pass
            product.main_image.save(main.name, main, save=True)
        # handle files
        add_imgs = request.FILES.getlist('additional_images')
        if add_imgs:
            for f in add_imgs:
                if f.size > 5 * 1024 * 1024:
                    continue
                product.additional_images.append(self._store_file(f, product))
            product.save()
        return Response(ProductSerializer(product, context={'request': request}).data)

    @action(detail=True, methods=['post'])
    def remove_image(self, request, pk=None):
        product = self.get_object()
        url = request.data.get('url')
        if url in product.additional_images:
            # try to delete file
            try:
                rel = url.replace(settings.MEDIA_URL, '').lstrip('/')
                path = os.path.join(settings.MEDIA_ROOT, rel)
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass
            product.additional_images.remove(url)
            product.save()
            return Response({'detail': 'removed'})
        return Response({'detail': 'not found'}, status=status.HTTP_404_NOT_FOUND)

    def _store_file(self, f, product):
        # save file to MEDIA_ROOT/products/<id>/ and return relative URL
        product_dir = os.path.join(settings.MEDIA_ROOT, 'products', str(product.id))
        os.makedirs(product_dir, exist_ok=True)
        path = os.path.join(product_dir, f.name)
        with open(path, 'wb+') as dest:
            for chunk in f.chunks():
                dest.write(chunk)
        return settings.MEDIA_URL + f'products/{product.id}/{f.name}'
