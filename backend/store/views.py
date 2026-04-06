from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count

from .models import (
    Category, Rug, Order, OrderItem,
    CustomDesign, ContactMessage, SiteSettings,
)
from .serializers import (
    CategorySerializer, RugListSerializer, RugDetailSerializer,
    OrderWriteSerializer, OrderReadSerializer,
    CustomDesignSerializer, ContactMessageSerializer,
    SiteSettingsSerializer,
)
from .filters import RugFilter
from .emails import (
    send_order_admin_notification, send_order_confirmation,
    send_contact_notification, send_custom_design_notification,
)


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(rug_count=Count("rugs")).order_by("order", "name")


class RugListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RugListSerializer
    filterset_class = RugFilter
    search_fields = ["title", "description"]
    ordering_fields = ["price", "created_at", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return Rug.objects.filter(is_active=True).select_related("category")


class FeaturedRugListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RugListSerializer
    pagination_class = None

    def get_queryset(self):
        return Rug.objects.filter(is_active=True, is_featured=True).select_related("category")[:12]


class RugDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = RugDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Rug.objects.filter(is_active=True).select_related("category").prefetch_related("images")


class RelatedRugsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = RugListSerializer
    pagination_class = None

    def get_queryset(self):
        slug = self.kwargs["slug"]
        try:
            rug = Rug.objects.get(slug=slug, is_active=True)
            return (
                Rug.objects.filter(is_active=True, category=rug.category)
                .exclude(pk=rug.pk)
                .select_related("category")[:4]
            )
        except Rug.DoesNotExist:
            return Rug.objects.none()


@api_view(["POST"])
@permission_classes([AllowAny])
def create_order(request):
    serializer = OrderWriteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    order = Order.objects.create(
        user=request.user if request.user.is_authenticated else None,
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        phone=data["phone"],
        notes=data.get("notes", ""),
    )

    total = 0
    for item_data in data["items"]:
        try:
            rug = Rug.objects.get(id=item_data["rug_id"], is_active=True)
        except Rug.DoesNotExist:
            order.delete()
            return Response(
                {"error": f"Rug {item_data['rug_id']} not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qty = item_data["quantity"]
        OrderItem.objects.create(
            order=order,
            rug=rug,
            title=rug.title,
            price=rug.price,
            quantity=qty,
        )
        total += rug.price * qty

    order.total = total
    order.save(update_fields=["total"])

    send_order_admin_notification(order)
    send_order_confirmation(order)

    return Response(
        OrderReadSerializer(order).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).prefetch_related("items")
    return Response(OrderReadSerializer(orders, many=True).data)


class CustomDesignCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CustomDesignSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        design = serializer.save(user=user)
        send_custom_design_notification(design)


class ContactMessageCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        contact = serializer.save()
        send_contact_notification(contact)


@api_view(["GET"])
@permission_classes([AllowAny])
def site_settings(request):
    settings_obj = SiteSettings.load()
    return Response(SiteSettingsSerializer(settings_obj).data)
