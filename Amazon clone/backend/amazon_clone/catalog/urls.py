from django.urls import path
from .views import ProductListView, CategoryListView, ProductDetailView
from rest_framework.routers import DefaultRouter
from .admin_views import AdminProductViewSet

router = DefaultRouter()
router.register(r'admin/products', AdminProductViewSet, basename='admin-products')

urlpatterns = [
    path('products/', ProductListView.as_view(), name='products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('categories/', CategoryListView.as_view(), name='categories'),
]
urlpatterns += router.urls
