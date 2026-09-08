from pathlib import Path

replacements = {
    "MEALORA WORLDWIDE": "MEALORA UGANDA",
    "One app. Every craving. Real data, real people, real delivery.": "One app. Every craving. Local food, real people, real delivery.",
    "Explore live cities": "Explore Uganda",
    "The world, delivered": "Uganda, delivered",
    "THE WORLD, DELIVERED": "UGANDA, DELIVERED",
    "Discover food, groceries and everyday joys from local makers in the cities that move you.": "Discover food, groceries and everyday joys from local makers across Uganda.",
    "Meals without borders": "Meals around Uganda",
    "Curated locally.<br />Delivered with care.": "Curated in Uganda.<br />Delivered with care.",
    "40+ cities": "4 Uganda cities",
    "from local to global": "from Kampala to Mbarara",
    "FROM LOCAL TO GLOBAL": "FROM KAMPALA TO MBARARA",
    "GOOD FOOD HAS NO BORDERS": "GOOD FOOD, WHEREVER YOU ARE",
    "Explore a city": "Explore Uganda",
    "through its food.": "through its food.",
    "LIVE DELIVERY NETWORK": "UGANDA DELIVERY NETWORK",
    "Real restaurants. Real couriers. Real-time data. Designed so the magic of a global marketplace still feels human.": "Real Ugandan restaurants. Real boda couriers. Real-time updates. Designed to make every local order feel easy.",
    "Know every city": "Know every neighbourhood",
    "A marketplace<br />with a <em>point of view.</em>": "A marketplace<br />with a <em>local point of view.</em>",
    "Your place<br />in the <em>world.</em>": "Your place<br />in <em>Uganda.</em>",
    "Restaurants, couriers and businesses get the tools to grow with a marketplace built for global ambition.": "Restaurants, boda couriers and businesses get the tools to grow with Uganda's favourite local marketplace.",
    "The world's local food<br />marketplace.": "Uganda's local food<br />marketplace.",
    "The world’s local food<br />marketplace.": "Uganda's local food<br />marketplace.",
    "Accra, Ghana": "Kampala, Uganda",
    "lat: 5.5722, lng: -0.1938": "lat: 0.3266, lng: 32.5825",
    "Kofi": "Moses",
}

for filename in [
    Path('/home/ubuntu/mealora-foods/client/src/pages/Home.tsx'),
    Path('/home/ubuntu/mealora-foods/client/src/pages/Partners.tsx'),
]:
    text = filename.read_text()
    for old, new in replacements.items():
        text = text.replace(old, new)
    filename.write_text(text)

metadata = Path('/home/ubuntu/mealora-foods/client/index.html')
text = metadata.read_text().replace("the world's local food marketplace", "Uganda's local food marketplace")
metadata.write_text(text)
