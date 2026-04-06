from django.contrib import admin
from django.utils.html import format_html
from .models import (
    SiteSettings, Category, Rug, RugImage,
    Order, OrderItem, CustomDesign, ContactMessage,
)


admin.site.site_header = "HumaniCarpet Admin"
admin.site.site_title = "HumaniCarpet"
admin.site.index_title = "Store Management"


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Hero Section", {"fields": ("hero_title", "hero_subtitle", "hero_image", "hero_cta_text")}),
        ("About", {"fields": ("about_short",)}),
    )

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "order", "rug_count"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["order", "name"]

    def rug_count(self, obj):
        return obj.rugs.count()
    rug_count.short_description = "Rugs"


class RugImageInline(admin.TabularInline):
    model = RugImage
    extra = 1


@admin.register(Rug)
class RugAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "price", "is_featured", "is_active", "thumb", "created_at"]
    list_filter = ["category", "is_featured", "is_active"]
    search_fields = ["title", "description"]
    prepopulated_fields = {"slug": ("title",)}
    inlines = [RugImageInline]
    list_editable = ["is_featured", "is_active"]

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="60" height="60" style="object-fit:cover;border-radius:8px;" />', obj.image.url)
        return "—"
    thumb.short_description = "Image"


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["rug", "title", "price", "quantity", "subtotal"]

    def subtotal(self, obj):
        return f"${obj.subtotal:.2f}"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["short_id", "first_name", "last_name", "email", "phone", "total", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["first_name", "last_name", "email", "phone"]
    readonly_fields = ["id", "user", "total", "created_at", "updated_at"]
    list_editable = ["status"]
    inlines = [OrderItemInline]

    def short_id(self, obj):
        return str(obj.id)[:8]
    short_id.short_description = "Order ID"


@admin.register(CustomDesign)
class CustomDesignAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "status", "preview", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["name", "email"]
    list_editable = ["status"]
    readonly_fields = ["id", "user", "design_image", "design_data", "created_at"]

    def preview(self, obj):
        if obj.design_image:
            return format_html('<img src="{}" width="80" height="80" style="object-fit:cover;border-radius:8px;" />', obj.design_image.url)
        return "—"
    preview.short_description = "Design"


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "subject", "is_read", "created_at"]
    list_filter = ["is_read", "created_at"]
    search_fields = ["name", "email", "subject"]
    list_editable = ["is_read"]
    readonly_fields = ["name", "email", "subject", "message", "created_at"]
