import axios from "axios";

export async function fetchWeather(city: string) {
	try {
		const response = await axios.get(`/api/weather`, {
			params: { city },
		});
		return response.data;
	} catch (error) {
		console.error("There was an error fetching the weather:", error);
		throw new Error("We couldn't fetch weather data");
	}
}
