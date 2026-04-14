from PIL import Image, ImageDraw

def remove_white_background(input_path, output_path):
    # Load the image and ensure it's in RGBA mode
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # We want to flood fill from the four corners to remove the solid white background
    # This preserves white snow peaks inside the mountain that don't touch the edges
    
    # 1. Identify the background color (already confirmed as 255,255,255)
    bg_color = (255, 255, 255, 255)
    target_color = (0, 0, 0, 0) # Transparent
    
    # Create a mask for the flood fill
    # Pillow's ImageDraw.floodfill is a bit primitive, so we'll use a specific approach
    
    # Start flood fill from coordinates known to be background
    # We'll check the 4 corners
    seeds = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    for seed in seeds:
        if img.getpixel(seed) == bg_color:
            ImageDraw.floodfill(img, seed, target_color, thresh=10)
            
    # Save as 32-bit PNG
    img.save(output_path, "PNG")
    print(f"Successfully processed {input_path} -> {output_path} (32-bit ARGB)")

if __name__ == "__main__":
    remove_white_background("assets/Pictures/Mountain.png", "assets/Pictures/Mountain.png")
