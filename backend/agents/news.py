import httpx
from xml.etree import ElementTree as ET

REGION_FEEDS = {
    "oslo":        "https://www.nrk.no/oslo/toppsaker.rss",
    "østfold":     "https://www.nrk.no/ostfold/toppsaker.rss",
    "bergen":      "https://www.nrk.no/vestland/toppsaker.rss",
    "trondheim":   "https://www.nrk.no/trondelag/toppsaker.rss",
    "stavanger":   "https://www.nrk.no/rogaland/toppsaker.rss",
    "tromsø":      "https://www.nrk.no/troms/toppsaker.rss",
    "drammen":     "https://www.nrk.no/viken/toppsaker.rss",
    "default":     "https://www.nrk.no/nyheter/toppsaker.rss",
}

CITY_TO_REGION = {
    "oslo": "oslo",
    "bergen": "bergen",
    "trondheim": "trondheim",
    "stavanger": "stavanger",
    "tromsø": "tromsø",
    "drammen": "drammen",
    "fredrikstad": "østfold",
    "sarpsborg": "østfold",
    "moss": "østfold",
    "halden": "østfold",
}

async def get_news(city: str) -> dict:
    city_lower = city.lower()
    region = CITY_TO_REGION.get(city_lower, "default")
    url = REGION_FEEDS.get(region, REGION_FEEDS["default"])
    headers = {"User-Agent": "CityPulse/1.0 citypulse@example.com"}

    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()

        root = ET.fromstring(response.content)
        items = root.findall(".//item")[:5]

        articles = []
        for item in items:
            title = item.findtext("title", "").strip()
            if title:
                articles.append({
                    "title":       title,
                    "link":        item.findtext("link", "").strip(),
                    "description": item.findtext("description", "").strip(),
                    "published":   item.findtext("pubDate", "").strip(),
                })

        return {"city": city, "articles": articles}

    except Exception as e:
        return {"error": str(e)}