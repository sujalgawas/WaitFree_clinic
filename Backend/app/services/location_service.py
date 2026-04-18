import re
from urllib.parse import unquote
import requests

def extract_coordinates_from_maps_link(maps_link):
    """
    Extract lat/lng from Google Maps link.
    Supports multiple URL formats including share links and short URLs.
    """
    if not maps_link:
        return None

    # Resolve short URLs (e.g. goo.gl)
    if 'goo.gl' in maps_link or 'shorturl' in maps_link:
        try:
            response = requests.head(maps_link, allow_redirects=True, timeout=5)
            maps_link = response.url
            print(f"Resolved short URL to: {maps_link}")
        except Exception as e:
            print(f"Failed to resolve short URL: {e}")

    decoded_link = unquote(maps_link)

    patterns = [
        r'@(-?\d+\.\d+),(-?\d+\.\d+)',
        r'q=(-?\d+\.\d+),(-?\d+\.\d+)',
        r'll=(-?\d+\.\d+),(-?\d+\.\d+)',
        r'/place/[^/]+/@(-?\d+\.\d+),(-?\d+\.\d+)',
        r'maps\?.*?(-?\d+\.\d+),(-?\d+\.\d+)',
        r'destination=(-?\d+\.\d+),(-?\d+\.\d+)',
    ]

    for pattern in patterns:
        match = re.search(pattern, decoded_link)
        if match:
            lat = float(match.group(1))
            lng = float(match.group(2))
            if -90 <= lat <= 90 and -180 <= lng <= 180:
                print(f"Extracted coordinates: {lat}, {lng} from {maps_link}")
                return {'lat': lat, 'lng': lng}

    print(f"Could not extract coordinates from: {maps_link}")
    return None
