import httpx
import os
from dotenv import load_dotenv

load_dotenv()

TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY")

async def get_events(city: str) -> dict:
    try:
        url = "https://app.ticketmaster.com/discovery/v2/events.json"
        params = {
            "apikey":      TICKETMASTER_API_KEY,
            "city":        city,
            "countryCode": "NO",
            "size":        5,
            "sort":        "date,asc",
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        items = data.get("_embedded", {}).get("events", [])
        events = []
        for item in items:
            events.append({
                "title":  item.get("name"),
                "date":   item.get("dates", {}).get("start", {}).get("localDate"),
                "time":   item.get("dates", {}).get("start", {}).get("localTime", ""),
                "venue":  item.get("_embedded", {}).get("venues", [{}])[0].get("name"),
                "link":   item.get("url"),
                "source": "ticketmaster",
            })

        return {"city": city, "events": events}

    except Exception as e:
        return {"city": city, "events": [], "error": str(e)}