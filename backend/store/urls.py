from django.urls import path
from . import views

urlpatterns = [
    path("settings/", views.site_settings, name="site-settings"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("rugs/", views.RugListView.as_view(), name="rug-list"),
    path("rugs/featured/", views.FeaturedRugListView.as_view(), name="rug-featured"),
    path("rugs/<slug:slug>/", views.RugDetailView.as_view(), name="rug-detail"),
    path("rugs/<slug:slug>/related/", views.RelatedRugsView.as_view(), name="rug-related"),
    path("orders/", views.create_order, name="order-create"),
    path("orders/mine/", views.my_orders, name="order-mine"),
    path("custom-designs/", views.CustomDesignCreateView.as_view(), name="custom-design-create"),
    path("contact/", views.ContactMessageCreateView.as_view(), name="contact-create"),
]
