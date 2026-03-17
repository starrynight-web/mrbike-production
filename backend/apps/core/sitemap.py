from django.http import HttpResponse
from apps.bikes.models import BikeModel
from apps.marketplace.models import UsedBikeListing
from apps.news.models import Article
from django.conf import settings

def sitemap_view(request):
    """
    Generate a dynamic sitemap.xml for search engines.
    Since this is a headless backend, we point to the frontend URLs.
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://mrbikebd.com').rstrip('/')
    
    urls = [
        f"{frontend_url}/",
        f"{frontend_url}/bikes",
        f"{frontend_url}/marketplace",
        f"{frontend_url}/compare",
        f"{frontend_url}/news",
        f"{frontend_url}/about",
        f"{frontend_url}/contact",
    ]
    
    # Dynamic Bike Pages
    for bike in BikeModel.objects.filter(is_available=True):
        urls.append(f"{frontend_url}/bike/{bike.slug}")
        
    # Dynamic Used Bike Pages
    for listing in UsedBikeListing.objects.filter(status='approved'):
        # Ensure we use slug if available, fallback to id
        slug_or_id = listing.slug if listing.slug else str(listing.id)
        urls.append(f"{frontend_url}/used-bike/{slug_or_id}")
        
    # Dynamic News Pages
    for news in Article.objects.filter(is_published=True):
        urls.append(f"{frontend_url}/news/{news.slug}")

    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url}</loc>\n'
        xml_content += '    <changefreq>daily</changefreq>\n'
        xml_content += '    <priority>0.8</priority>\n'
        xml_content += '  </url>\n'
        
    xml_content += '</urlset>'
    
    return HttpResponse(xml_content, content_type='application/xml')
