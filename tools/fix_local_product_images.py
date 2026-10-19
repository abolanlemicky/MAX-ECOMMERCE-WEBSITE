from pathlib import Path
import shutil

root = Path(r'C:\Users\mypc\OneDrive\Documents\premium-ecommerce-platform')
assets = root / 'assets' / 'products'
assets.mkdir(parents=True, exist_ok=True)
source = Path(r'C:\Users\mypc\Desktop\ecommerce_images')

# Copy all available product images into the project so the storefront can load them over localhost
for item in source.iterdir():
    if item.is_file():
        shutil.copy2(item, assets / item.name)

product_path = root / 'js' / 'products.js'
text = product_path.read_text(encoding='utf-8')

pairs = {
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Tecno-Phantom-V-Fold.jfif': 'assets/products/Tecno-Phantom-V-Fold.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Infinix-Note-40-Pro.jfif': 'assets/products/Infinix-Note-40-Pro.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Google-Pixel-8-Pro.jfif': 'assets/products/Google-Pixel-8-Pro.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/ASUS-ZenBook-14.jfif': 'assets/products/ASUS-ZenBook-14.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Apple-AirPods-Pro-2.jfif': 'assets/products/Apple-AirPods-Pro-2.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Anker-737-Charger.jfif': 'assets/products/Anker-737-Charger.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/JBL-Flip-6.jfif': 'assets/products/JBL-Flip-6.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/H%26M-Organic-Hoodie.jfif': 'assets/products/H&M-Organic-Hoodie.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Casio-G-Shock-GA-B001.jfif': 'assets/products/Casio-G-Shock-GA-B001.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Maybelline-Fit-Me-Foundation.jfif': 'assets/products/Maybelline-Fit-Me-Foundation.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/ASUS-ROG-Ally.jfif': 'assets/products/ASUS-ROG-Ally.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/LG-8kg-Front-Loader-Washer.jfif': 'assets/products/LG-8kg-Front-Loader-Washer.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Samsung-36L-Microwave-Oven.jfif': 'assets/products/Samsung-36L-Microwave-Oven.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Haier-Thermocool-2-DoorFridge.jfif': 'assets/products/Haier-Thermocool-2-DoorFridge.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Philips-Air-Fryer-XXL.jfif': 'assets/products/Philips-Air-Fryer-XXL.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Ninja-Blender-1000W.png': 'assets/products/Ninja-Blender-1000W.png',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Russell-Hobbs-Kettle.jfif': 'assets/products/Russell-Hobbs-Kettle.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/De%E2%80%99Longhi-Espresso-Machine.png': 'assets/products/De’Longhi-Espresso-Machine.png',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Prestige-Cookware-Set.jfif': 'assets/products/Prestige-Cookware-Set.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Golden-Morn-Cereal.jfif': 'assets/products/Golden-Morn-Cereal.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Indomie-Instant-Noodles.jfif': 'assets/products/Indomie-Instant-Noodles.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Bournvita-1kg.jfif': 'assets/products/Bournvita-1kg.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Onga-Chicken-Seasoning.jfif': 'assets/products/Onga-Chicken-Seasoning.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Kellogg%E2%80%99s-Corn-Flakes.jfif': 'assets/products/Kellogg’s-Corn-Flakes.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/Dettol-Antiseptic.jfif': 'assets/products/Dettol-Antiseptic.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/HP-DeskJet-Ink-Tank-Printer.jfif': 'assets/products/HP-DeskJet-Ink-Tank-Printer.jfif',
    'file:///C:/Users/mypc/Desktop/ecommerce_images/UGREEN-65W-USB-C-Charger.jfif': 'assets/products/UGREEN-65W-USB-C-Charger.jfif',
}

for old, new in pairs.items():
    text = text.replace(old, new)

product_path.write_text(text, encoding='utf-8')
print(f'Copied {len(list((source).iterdir()))} images and updated {len(pairs)} product references.')
