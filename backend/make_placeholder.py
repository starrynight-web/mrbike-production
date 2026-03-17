from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder():
    # Create a nice gray background placeholder
    img = Image.new('RGB', (800, 600), color = (230, 235, 240))
    d = ImageDraw.Draw(img)
    
    # Try to write some text
    text = "No Image Available"
    
    # Simple centered text (using default font if custom isn't available)
    try:
        # Get a larger font if possible
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()

    # Get text size using textbbox for newer Pillow versions
    if hasattr(font, 'getbbox'):
        # Pillow >= 9.2.0
        left, top, right, bottom = font.getbbox(text)
        text_width = right - left
        text_height = bottom - top
    elif hasattr(d, 'textsize'):
        # Pillow < 9.2.0
        text_width, text_height = d.textsize(text, font=font)
    else:
        text_width, text_height = (200, 20) # Guessed fallback
        
    x = (800 - text_width) // 2
    y = (600 - text_height) // 2
    
    d.text((x, y), text, fill=(150, 150, 160), font=font)
    
    # Save as webp in public directory
    public_dir = os.path.join("e:\\mr\\frontend\\public")
    bikes_dir = os.path.join(public_dir, "bikes")
    
    if not os.path.exists(bikes_dir):
        os.makedirs(bikes_dir)
        
    img.save(os.path.join(public_dir, "placeholder-bike.webp"), format="WEBP")
    img.save(os.path.join(bikes_dir, "default.webp"), format="WEBP")
    print("Successfully created placeholder images.")

if __name__ == "__main__":
    create_placeholder()
