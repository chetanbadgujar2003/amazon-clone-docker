from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Cart, CartItem
from products.models import Product
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(
            user_id=request.user.id,
            defaults={'user_username': request.user.username}
        )
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            product = Product.objects.get(id=serializer.validated_data['product_id'])
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart, _ = Cart.objects.get_or_create(
            user_id=request.user.id,
            defaults={'user_username': request.user.username}
        )
        
        # Check if product already in cart
        cart_item = None
        for item in cart.items:
            if str(item.product_id) == str(product.id):
                item.quantity += serializer.validated_data['quantity']
                cart_item = item
                break
        
        if not cart_item:
            cart.items.append(CartItem(
                product_id=product.id,
                product_name=product.name,
                product_price=product.price,
                product_image=product.image,
                quantity=serializer.validated_data['quantity']
            ))
        
        cart.save()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        try:
            cart = Cart.objects.get(user_id=request.user.id)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        qty = serializer.validated_data['quantity']
        
        # Find and update cart item by index
        found = False
        for i, item in enumerate(cart.items):
            if str(item.product_id) == item_id:
                if qty == 0:
                    cart.items.pop(i)
                else:
                    item.quantity = qty
                found = True
                break
        
        if not found:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart.save()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)

    def delete(self, request, item_id):
        try:
            cart = Cart.objects.get(user_id=request.user.id)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Find and remove cart item
        found = False
        for i, item in enumerate(cart.items):
            if str(item.product_id) == item_id:
                cart.items.pop(i)
                found = True
                break
        
        if not found:
            return Response({'error': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart.save()
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)