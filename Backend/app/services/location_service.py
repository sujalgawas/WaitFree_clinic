import re
from urllib.parse import unquote


def extract_coordinates_from_maps_link(maps_link):
    """
    Extract lat/lng from Google Maps link.
    Supports multiple URL formats including share links.
    """
    if not maps_link:
        return None

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
