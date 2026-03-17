import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

from apps.bikes.models import BikeModel
from apps.news.models import Article

def print_raw():
    lines = []
    
    b = BikeModel.objects.first()
    if b:
        # Get raw value from db dict
        from django.forms.models import model_to_dict
        md = model_to_dict(b)
        lines.append(f"Bike image1 raw: {b.image1}")
        lines.append(f"Bike image1 str: {str(b.image1)}")
        lines.append(f"Bike dict raw: {md.get('image1')}")
    else:
        lines.append("No bikes")
        
    a = Article.objects.first()
    if a:
        lines.append(f"Article image raw: {a.featured_image}")
        lines.append(f"Article image str: {str(a.featured_image)}")
    else:
        lines.append("No articles")

    with open("raw_out.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

if __name__ == "__main__":
    print_raw()
