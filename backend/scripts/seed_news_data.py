import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.news.models import NewsCategory, Tag

def seed_news():
    categories = [
        {'name': 'Launch', 'slug': 'launch'},
        {'name': 'Review', 'slug': 'review'},
        {'name': 'Feature', 'slug': 'feature'},
        {'name': 'Tips', 'slug': 'tips'},
        {'name': 'News', 'slug': 'news'},
    ]

    for cat_data in categories:
        cat, created = NewsCategory.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={'name': cat_data['name']}
        )
        if created:
            print(f"Created category: {cat.name}")
        else:
            print(f"Category already exists: {cat.name}")

    tags = ['Yamaha', 'Suzuki', 'Honda', 'TVS', 'Bajaj', 'Hero', 'Royal Enfield', 'KTM']
    for tag_name in tags:
        tag, created = Tag.objects.get_or_create(name=tag_name)
        if created:
            print(f"Created tag: {tag.name}")

if __name__ == "__main__":
    seed_news()
