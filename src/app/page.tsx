"use client"; // make this component client-side

import { useState, useEffect } from "react";
import { fetchWeather } from "../lib/fetchWeather";

export default function Home() {
	const [city, setCity] = useState("");
	const [weather, setWeather] = useState<any>(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [favorites, setFavorites] = useState<string[]>([]);
	const [username, setUsername] = useState<string | null>(null);

	// load username and favorites from localStorage
	useEffect(() => {
		const savedUser = localStorage.getItem("skynowUsername");
		const savedFavorites = localStorage.getItem("skynowFavorites");
		if (savedUser) setUsername(savedUser);
		if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
	}, []);

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

	//add city to favorites function
	const handleAddFavorite = async () => {
		if (!weather || !weather.location?.name) {
			setError("No city to add.");
			return;
		}

		const cityName = weather.location.name;

		// if already favorited, do nothing
		if (favorites.includes(cityName)) {
			setError(`${cityName} is already in your favorites.`);
			return;
		}

		// update frontend immediately
		setFavorites((prev) => {
			const updated = [...prev, cityName];
			localStorage.setItem("skynowFavorites", JSON.stringify(updated));
			return updated;
		});

		// if user not logged in
		if (!username) {
			setError("Log in to save your favorites permanently.");
			// still store locally
			const localFavs = JSON.parse(localStorage.getItem("skynowFavorites") || "[]");
			if (!localFavs.includes(city)) {
				localFavs.push(city);
				localStorage.setItem("skynowFavorites", JSON.stringify(localFavs));
			}
			return;
		}
		// if logged in, save to MongoDB
		try {
			const res = await fetch("/api/favorites", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, city }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Failed to add favorite.");
				return;
			}
		} catch (err) {
			console.error(err);
			setError("Failed to connect to server.");
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

					<button onClick={handleAddFavorite} className="mt-2 bg-yellow-400 px-3 py-1 rounded">
						Add to Favorites
					</button>
				</div>
			)}

			{/* favorites list */}
			{favorites.length > 0 && (
				<div className="mt-6">
					<h3 className="text-lg font-semibold">Your Favorites</h3>
					<ul>
						{favorites.map((fav) => (
							<li key={fav}>{fav}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
