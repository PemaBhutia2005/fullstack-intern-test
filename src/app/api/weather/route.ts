import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

	try {
		// get the "city" parameter from the URL
		const url = new URL(request.url);
		const city = url.searchParams.get("city");

		// throw error if no city was entered
		if (!city) {
			return NextResponse.json({ error: "Please enter the city whose weather you want to see." }, { status: 400 });
		}

		// fetch from WeatherAPI
		const response = await axios.get("https://api.weatherapi.com/v1/current.json", {
			params: {
				key: apiKey,
				q: city,
				aqi: "no",
			},
		});

		// return weather data as JSON
		return NextResponse.json(response.data);
	} catch (error) {
		return NextResponse.json({ error: "We couldn't fetch this city's weather data right now." }, { status: 500 });
	}
}
