from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    main_image = serializers.ImageField(required=False, allow_null=True)
    additional_images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'original_price', 'category', 'brand', 'stock', 'main_image', 'additional_images', 'status', 'featured', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_main_image(self, obj):
        # kept for compatibility; handled in to_representation
        return None

    def get_additional_images(self, obj):
        request = self.context.get('request')
        result = []
        for url in obj.additional_images or []:
            if url.startswith('http'):
                result.append(url)
            else:
                if request:
                    result.append(request.build_absolute_uri(url))
                else:
                    result.append(url)
        return result

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        # main_image may be a FileField - convert to absolute URL
        try:
            if instance.main_image:
                url = instance.main_image.url
                data['main_image'] = request.build_absolute_uri(url) if request else url
            else:
                data['main_image'] = None
        except Exception:
            data['main_image'] = None
        return data

    def validate(self, data):
        # basic required fields
        if not data.get('name'):
            raise serializers.ValidationError({'name': 'Product name is required'})
        if not data.get('description'):
            raise serializers.ValidationError({'description': 'Product description is required'})
        if data.get('price') is None:
            raise serializers.ValidationError({'price': 'Price is required'})
        return data
