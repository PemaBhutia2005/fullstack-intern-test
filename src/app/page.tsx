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

	const [isCelsius, setIsCelsius] = useState(true);

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

	// remove a city from favorites
	const handleRemoveFavorite = async (city: string) => {
		// remove locally first
		const updatedFavorites = favorites.filter((fav) => fav !== city);
		setFavorites(updatedFavorites);
		localStorage.setItem("skynowFavorites", JSON.stringify(updatedFavorites));

		// if user is logged in, also remove from MongoDB
		if (username) {
			try {
				const res = await fetch("/api/favorites", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ username, city }),
				});

				const data = await res.json();
				if (!res.ok) {
					setError(data.error || "Failed to remove favorite from database.");
				}
			} catch (err) {
				console.error(err);
				setError("Failed to connect to server.");
			}
		}
	};

	//toggle between Celsius and Fahrenheit
	function toggleUnit() {
		if (isCelsius) {
			setIsCelsius(false);
		} else {
			setIsCelsius(true);
		}
	}
	return (
		<div>
			<h1>Get real-time weather conditions of any city worldwide</h1>
			<input type="text" placeholder="Enter a city..." value={city} onChange={(e) => setCity(e.target.value)} />
			<button onClick={handleSearch}>Search</button>

			{/* temperature unit toggle */}
			<button onClick={toggleUnit} className="ml-3 bg-gray-200 px-2 py-1 rounded text-sm">
				Switch to {isCelsius ? "°F" : "°C"}
			</button>

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
					{/* temperature display changes depending on toggle */}
					<p>{isCelsius ? `${weather.current.temp_c}°C (Feels like ${weather.current.feelslike_c}°C)` : `${weather.current.temp_f}°F (Feels like ${weather.current.feelslike_f}°F)`}</p>
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
							<li key={fav} className="flex items-center justify-between">
								<span>{fav}</span>
								<button onClick={() => handleRemoveFavorite(fav)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
									Remove
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
