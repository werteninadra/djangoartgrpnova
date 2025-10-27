from PIL import Image, ImageDraw
import random
import os
from django.conf import settings

def generate_abstract_artwork(width=800, height=600):
    """
    Generate a unique abstract artwork using Pillow.
    Creates random geometric shapes with varying colors.
    """
    # Create a new image with a random background color
    bg_color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    image = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(image)

    # Generate random shapes
    num_shapes = random.randint(5, 20)

    for _ in range(num_shapes):
        # Random shape type
        shape_type = random.choice(['rectangle', 'ellipse', 'polygon'])

        # Random position and size
        x1 = random.randint(0, width - 100)
        y1 = random.randint(0, height - 100)
        x2 = x1 + random.randint(50, 200)
        y2 = y1 + random.randint(50, 200)

        # Random color
        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))

        # Random outline
        outline = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
        outline_width = random.randint(0, 5)

        if shape_type == 'rectangle':
            draw.rectangle([x1, y1, x2, y2], fill=color, outline=outline, width=outline_width)
        elif shape_type == 'ellipse':
            draw.ellipse([x1, y1, x2, y2], fill=color, outline=outline, width=outline_width)
        elif shape_type == 'polygon':
            # Create a random polygon
            points = []
            num_points = random.randint(3, 8)
            for _ in range(num_points):
                px = random.randint(x1, x2)
                py = random.randint(y1, y2)
                points.append((px, py))
            draw.polygon(points, fill=color, outline=outline, width=outline_width)

    return image

def save_generated_artwork(image, filename):
    """
    Save the generated image to the media directory.
    """
    media_root = settings.MEDIA_ROOT
    oeuvres_dir = os.path.join(media_root, 'oeuvres')
    os.makedirs(oeuvres_dir, exist_ok=True)

    filepath = os.path.join(oeuvres_dir, filename)
    image.save(filepath)
    return filepath