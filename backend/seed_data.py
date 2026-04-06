"""
Seed script: populates database with sample categories and rugs.
Run with: py -3 manage.py shell < seed_data.py
"""
import os
import shutil
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.conf import settings
from store.models import Category, Rug, SiteSettings

MEDIA_RUGS = settings.MEDIA_ROOT / "rugs"
MEDIA_RUGS.mkdir(parents=True, exist_ok=True)

ASSETS = r"C:\Users\ASUS\.cursor\projects\c-Users-ASUS-Desktop-HumaniCarpet\assets"

IMAGE_MAP = {
    "bart-simpson-rug": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-27-19426605-0c21-45de-af0a-39527faeaa7e.png",
    "vw-van-nature": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-15-c5c413a7-21df-4563-94bb-5a0a4f93eaed.png",
    "itachi-uchiha": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-25-b88148ef-796b-40db-990b-91f3c8dbaa52.png",
    "akatsuki-cloud": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-24-ba939413-157a-4083-98a8-45ef731cd90f.png",
    "moss-garden": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-16-87da1e63-8c36-49e6-bab8-169aefb376a7.png",
    "horror-car-mat": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-21-a6636f5b-522e-497d-86f7-33895358acf2.png",
    "oni-car-mat": "c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_f0d6a03bcb1101a1b918f0829f292850_images_photo_2026-03-31_00-48-20-edfbad09-2042-4ae4-b478-ba2dfde035a8.png",
}


def copy_image(key):
    src = os.path.join(ASSETS, IMAGE_MAP[key])
    dst_name = f"{key}.png"
    dst = MEDIA_RUGS / dst_name
    if not dst.exists():
        shutil.copy2(src, dst)
    return f"rugs/{dst_name}"


# Categories
cats = {}
for name in ["Cartoons", "Movies", "Nature", "Cars", "Car Rugs"]:
    cat, _ = Category.objects.get_or_create(name=name)
    cats[name] = cat

# Rugs
rugs_data = [
    {"title": "Bart Simpson Pop Art Rug", "key": "bart-simpson-rug", "cat": "Cartoons", "price": 149.99, "desc": "Bold, eye-popping Bart Simpson rug with his signature mischievous expression. Hand-tufted with vibrant yellow, red, and black yarns. A statement piece for any pop culture fan.", "featured": True},
    {"title": "VW Van Sunset Adventure", "key": "vw-van-nature", "cat": "Nature", "price": 189.99, "desc": "A dreamy circular rug featuring a classic VW van against mountains and a flowing river. Warm sunset colors and intricate tufted textures bring the outdoors inside.", "featured": True},
    {"title": "Itachi Uchiha Shinobi Rug", "key": "itachi-uchiha", "cat": "Movies", "price": 179.99, "desc": "The legendary Itachi in his iconic Akatsuki cloak, tufted in deep blacks, grays, and crimson. Detailed hand-carved features capture every shadow of this fan-favorite character.", "featured": True},
    {"title": "Akatsuki Cloud Symbol", "key": "akatsuki-cloud", "cat": "Movies", "price": 129.99, "desc": "The unmistakable red cloud of the Akatsuki organization, hand-tufted with bold red, white, and black contrast. Clean lines and rich texture.", "featured": True},
    {"title": "Moss Garden Landscape", "key": "moss-garden", "cat": "Nature", "price": 219.99, "desc": "A living-art rug inspired by Japanese moss gardens. Rich greens, turquoise pools, and pops of pink and orange create a calming, organic landscape for your floor.", "featured": True},
    {"title": "Horror Glow Car Mat", "key": "horror-car-mat", "cat": "Car Rugs", "price": 89.99, "desc": "A terrifyingly cool car floor mat featuring a glowing horror face. UV-reactive design that looks incredible under ambient lighting. Tufted for durability and grip.", "featured": False},
    {"title": "Oni Demon Car Mat", "key": "oni-car-mat", "cat": "Car Rugs", "price": 99.99, "desc": "Japanese Oni demon mask with crossed katanas — a fierce, intricately tufted car mat. Purple, red, and black tones with incredible detail work.", "featured": True},
]

for rd in rugs_data:
    image_path = copy_image(rd["key"])
    rug, created = Rug.objects.get_or_create(
        title=rd["title"],
        defaults={
            "category": cats[rd["cat"]],
            "price": rd["price"],
            "description": rd["desc"],
            "image": image_path,
            "is_featured": rd["featured"],
            "is_active": True,
        },
    )
    if created:
        print(f"Created: {rug.title}")
    else:
        print(f"Exists: {rug.title}")

# Site Settings
ss = SiteSettings.load()
ss.hero_title = "Handcrafted Rugs, Made with Soul"
ss.hero_subtitle = "Each piece tells a story — woven by hand, designed with love. From anime to nature, we turn any design into a textured masterpiece."
ss.hero_cta_text = "Explore Collection"
ss.about_short = "We create beautiful handmade tufted rugs that turn any space into art. Every rug is crafted by skilled artisans with premium materials and unmatched attention to detail."
ss.save()
print("Site settings updated.")
print("Seed complete!")
