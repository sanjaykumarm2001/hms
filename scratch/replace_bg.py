from PIL import Image

def process_logo():
    img_path = "public/lodgely-logo.jpg"
    img = Image.open(img_path).convert("RGB")
    pixels = img.load()
    width, height = img.size

    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            # Check for neutral gray/white background pixels (checkerboard pattern)
            # Neutral gray/white pixels have R, G, B values close to each other and bright (min channel > 110)
            diff_rg = abs(r - g)
            diff_gb = abs(g - b)
            diff_rb = abs(r - b)
            
            # Green/yellow logo elements have high green relative to blue (g - b > 25) or (g > 80 and r > 150 and g - b > 20)
            is_green_or_yellow = (g - b > 25) or (g > 100 and r > 140 and g - b > 15) or (g > 50 and r < 80 and b < 80)
            
            if not is_green_or_yellow and (diff_rg < 25 and diff_gb < 25 and diff_rb < 25 and r > 110):
                pixels[x, y] = (255, 255, 255)

    img.save(img_path, quality=95)
    print("Saved logo with solid white background.")

if __name__ == "__main__":
    process_logo()
