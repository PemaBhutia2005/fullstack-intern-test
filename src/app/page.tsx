"use client"; // make this component client-side

import { useState } from "react";
import { fetchWeather } from "../lib/fetchWeather";

export default function Home() {
	const [city, setCity] = useState("");
	const [weather, setWeather] = useState<any>(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// search function
	const handleSearch = async () => {
		setLoading(true);
		setError(""); // clear previous errors
		setWeather(null); // clear previous weather data

		// api call
		try {
			const data = await fetchWeather(city);
			setWeather(data);
		} catch {
			setError("We failed to fetch weather data.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h1>Get real-time weather conditions of any city worldwide</h1>
			<input type="text" placeholder="Enter a city..." value={city} onChange={(e) => setCity(e.target.value)} />
			<button onClick={handleSearch}>Search</button>

			{/* conditional renderings */}
			{loading && <p>Loading...</p>}
			{error && <p className="text-red-500">{error}</p>}
			{weather && (
				<div>
					<h2>
						{weather.location.name}, {weather.location.country}
					</h2>
					<p>Local time: {weather.location.localtime}</p>
					<img src={weather.current.condition.icon} alt={weather.current.condition.text} />
					<p>{weather.current.condition.text}</p>
					<p>
						{weather.current.temp_c}°C (Feels like {weather.current.feelslike_c}°C)
					</p>
					<p>Humidity: {weather.current.humidity}%</p>
					<p>
						Wind: {weather.current.wind_kph} km/h {weather.current.wind_dir}
					</p>
					<p>Visibility: {weather.current.vis_km} km</p>
					<p>Pressure: {weather.current.pressure_mb} mb</p>
				</div>
			)}
		</div>
	);
}
