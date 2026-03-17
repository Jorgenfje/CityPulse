import httpx

async def get_coords(city: str) -> tuple[float, float] | None:
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{city}, Norge",
        "format": "json",
        "limit": 1,
        "countrycode": "no",
    }
    headers = {
        "User-Agent": "CityPulse/1.0 (portfolio project; contact: post@fjellstadteknologi.no)",
        "Accept-Language": "no",
        "Referer": "https://fjellstadteknologi.no",
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()
    if not data:
        return None
    return float(data[0]["lat"]), float(data[0]["lon"])

async def get_weather(city: str) -> dict:
    coords = await get_coords(city)
    if not coords:
        return {"error": f"Fant ikke koordinater for {city}"}

    lat, lon = coords
    url = f"https://api.met.no/weatherapi/locationforecast/2.0/compact?lat={lat}&lon={lon}"
    headers = {
        "User-Agent": "CityPulse/1.0 (portfolio project; contact: post@fjellstadteknologi.no)",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

        timeseries = data["properties"]["timeseries"][:6]
        forecast = []
        for entry in timeseries:
            details = entry["data"]["instant"]["details"]
            forecast.append({
                "time":        entry["time"],
                "temperature": details.get("air_temperature"),
                "wind_speed":  details.get("wind_speed"),
                "humidity":    details.get("relative_humidity"),
            })

        return {
            "city":     city,
            "coords":   {"lat": lat, "lon": lon},
            "forecast": forecast
        }

    except Exception as e:
        return {"error": str(e)}