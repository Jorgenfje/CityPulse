import httpx

SSB_URL = "https://data.ssb.no/api/v0/no/table/07230/"

SUPPORTED_CITIES = ["oslo", "fredrikstad", "moss", "sarpsborg"]

async def get_property(city: str) -> dict:
    city_lower = city.lower()
    if city_lower not in SUPPORTED_CITIES:
        return {"error": f"Ukjent by: {city}"}

    query = {
        "query": [
            {
                "code": "ContentsCode",
                "selection": {
                    "filter": "item",
                    "values": ["BruktBlindex"]
                }
            },
            {
                "code": "Tid",
                "selection": {
                    "filter": "top",
                    "values": ["8"]
                }
            }
        ],
        "response": {"format": "json-stat2"}
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SSB_URL, json=query)
            response.raise_for_status()
            data = response.json()

        periods = list(data["dimension"]["Tid"]["category"]["label"].values())
        values  = data["value"]

        price_index = []
        for period, value in zip(periods, values):
            if value is not None:
                price_index.append({
                    "year":  period,
                    "index": value
                })

        return {
            "city":        city,
            "note":        "Nasjonal prisindeks for brukte boliger (SSB). 2015 = 100.",
            "price_index": price_index
        }

    except Exception as e:
        return {"error": str(e)}