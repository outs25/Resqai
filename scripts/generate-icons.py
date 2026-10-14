import os
from PIL import Image, ImageDraw

def create_emergency_icon(size, output_path):
    # Create image with transparent background (RGBA)
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Outer rounded rectangle (Emergency Red #D93829)
    corner_radius = int(size * 0.22)
    padding = int(size * 0.04)
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=corner_radius,
        fill=(217, 56, 41, 255) # #D93829
    )

    # Inner subtle glow/stroke
    inner_pad = padding + int(size * 0.02)
    draw.rounded_rectangle(
        [inner_pad, inner_pad, size - inner_pad, size - inner_pad],
        radius=int(corner_radius * 0.9),
        outline=(255, 255, 255, 60),
        width=max(1, int(size * 0.015))
    )

    # Draw Emergency White Cross
    center = size // 2
    cross_width = int(size * 0.16)
    cross_len = int(size * 0.52)
    half_w = cross_width // 2
    half_l = cross_len // 2

    # Vertical bar of the cross
    draw.rounded_rectangle(
        [center - half_w, center - half_l, center + half_w, center + half_l],
        radius=int(cross_width * 0.3),
        fill=(255, 255, 255, 255)
    )

    # Horizontal bar of the cross
    draw.rounded_rectangle(
        [center - half_l, center - half_w, center + half_l, center + half_w],
        radius=int(cross_width * 0.3),
        fill=(255, 255, 255, 255)
    )

    # Small centered blue dot / AI badge
    dot_r = int(size * 0.04)
    draw.ellipse(
        [center - dot_r, center - dot_r, center + dot_r, center + dot_r],
        fill=(0, 92, 184, 255) # Primary Blue
    )

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"Generated {output_path} ({size}x{size})")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, 'public')
    
    create_emergency_icon(192, os.path.join(public_dir, 'icon-192.png'))
    create_emergency_icon(512, os.path.join(public_dir, 'icon-512.png'))
    create_emergency_icon(180, os.path.join(public_dir, 'apple-touch-icon.png'))
    
    # Save 48x48 as favicon.ico
    fav = Image.open(os.path.join(public_dir, 'icon-192.png')).resize((48, 48), Image.Resampling.LANCZOS)
    fav.save(os.path.join(public_dir, 'favicon.ico'), format='ICO')
    print("Generated favicon.ico (48x48)")
