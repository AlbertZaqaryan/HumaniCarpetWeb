from django_filters import rest_framework as filters
from .models import Rug


class RugFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")
    category = filters.CharFilter(field_name="category__slug")
    featured = filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = Rug
        fields = ["category", "min_price", "max_price", "featured"]
