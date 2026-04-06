from rest_framework import serializers
from .models import (
    Category, Rug, RugImage, Order, OrderItem,
    CustomDesign, ContactMessage, SiteSettings,
)


class CategorySerializer(serializers.ModelSerializer):
    rug_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "image", "description", "rug_count"]


class RugImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RugImage
        fields = ["id", "image", "order"]


class RugListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Rug
        fields = [
            "id", "title", "slug", "price", "image",
            "category", "category_name", "is_featured", "created_at",
        ]


class RugDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)
    images = RugImageSerializer(many=True, read_only=True)

    class Meta:
        model = Rug
        fields = [
            "id", "title", "slug", "description", "price", "image",
            "images", "category", "category_name", "is_featured",
            "created_at", "updated_at",
        ]


class OrderItemWriteSerializer(serializers.Serializer):
    rug_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class OrderItemReadSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "rug", "title", "price", "quantity", "subtotal"]


class OrderWriteSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    items = OrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value


class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "first_name", "last_name", "email", "phone",
            "status", "notes", "total", "items", "created_at",
        ]


class CustomDesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomDesign
        fields = [
            "id", "name", "email", "phone", "description",
            "design_image", "design_data", "status", "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "hero_title", "hero_subtitle", "hero_image",
            "hero_cta_text", "about_short",
        ]
