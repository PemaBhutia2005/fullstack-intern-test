"use client"; // make this component client-side

import { Weather } from "./types/weather";
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
	const [favoriteWeathers, setFavoriteWeathers] = useState<Weather[]>([]);

	// load username and favorites from localStorage
	useEffect(() => {
		const savedUser = localStorage.getItem("skynowUsername");
		const savedFavorites = localStorage.getItem("skynowFavorites");
		if (savedUser) setUsername(savedUser);
		if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
	}, []);

	useEffect(() => {
		// fetch weather for each favorite city
		favoriteWeathers.length = 0; // clear before updating
		favorites.forEach(async (favCity) => {
			try {
				const data = await fetchWeather(favCity);
				setFavoriteWeathers((prev) => [...prev, data]);
			} catch (err) {
				console.error("Failed to fetch favorite city:", favCity, err);
			}
		});
	}, [favorites]);

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

	const renderWeatherCard = (weather: Weather) => (
		<div key={weather.location.name} className="bg-white shadow rounded p-4 w-64 flex flex-col items-center">
			<h3 className="text-xl font-bold">
				{weather.location.name}, {weather.location.country}
			</h3>
			<p className="text-sm mb-1">Local time: {weather.location.localtime}</p>
			<img src={weather.current.condition.icon} alt={weather.current.condition.text} />
			<p className="font-medium">{weather.current.condition.text}</p>
			<p className="text-lg font-semibold">{isCelsius ? `${weather.current.temp_c}°C (Feels like ${weather.current.feelslike_c}°C)` : `${weather.current.temp_f}°F (Feels like ${weather.current.feelslike_f}°F)`}</p>
			<p>Humidity: {weather.current.humidity}%</p>
			<p>
				Wind: {weather.current.wind_kph} km/h {weather.current.wind_dir}
			</p>
			<p>Visibility: {weather.current.vis_km} km</p>
			<p>Pressure: {weather.current.pressure_mb} mb</p>
			{favorites.includes(weather.location.name) && (
				<button onClick={() => handleRemoveFavorite(weather.location.name)} className="mt-2 bg-red-500 text-white px-3 py-1 rounded">
					Remove
				</button>
			)}
		</div>
	);

	return (
		<div className="min-h-screen to-white flex flex-col items-center px-6 py-12">
			<header className="text-center max-w-2xl mb-10">
				<h1 className="text-4xl md:text-5xl font-bold text-sky-700 mb-4">Get real-time weather conditions of any city worldwide</h1>

				<div className="flex items-center justify-center gap-3 w-full">
					<input
						type="text"
						placeholder="Enter a city..."
						className="w-full md:w-2/3 px-5 py-3 border border-gray-300 rounded-2xl text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
						value={city}
						onChange={(e) => setCity(e.target.value)}
					/>
					<button className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-2xl font-semibold shadow transition" onClick={handleSearch}>
						Search
					</button>
				</div>
			</header>

			{/* temperature unit toggle */}
			<button onClick={toggleUnit} className="mb-8 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-sm text-gray-700 transition">
				Switch to {isCelsius ? "°F" : "°C"}
			</button>

			{/* conditional renderings */}
			{loading && <p className="text-gray-600 text-lg">Loading...</p>}
			{error && <p className="text-red-500  mb-4">{error}</p>}
			{weather && (
				<div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md text-center mb-12 transition">
					<h2 className="text-2xl font-bold mb-1">
						{weather.location.name}, {weather.location.country}
					</h2>
					<p className="text-gray-500 mb-3">Local time: {weather.location.localtime}</p>
					<img src={weather.current.condition.icon} alt={weather.current.condition.text} className="mx-auto w-16 h-16" />
					<p className="text-lg font-medium mb-1">{weather.current.condition.text}</p>
					{/* temperature display changes depending on toggle */}
					<p className="text-2xl font-semibold mb-2">{isCelsius ? `${weather.current.temp_c}°C (Feels like ${weather.current.feelslike_c}°C)` : `${weather.current.temp_f}°F (Feels like ${weather.current.feelslike_f}°F)`}</p>
					<div className="text-sm text-gray-600 space-y-1">
						<p>Humidity: {weather.current.humidity}%</p>
						<p>
							Wind: {weather.current.wind_kph} km/h {weather.current.wind_dir}
						</p>
						<p>Visibility: {weather.current.vis_km} km</p>
						<p>Pressure: {weather.current.pressure_mb} mb</p>
					</div>

					<button onClick={handleAddFavorite} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-xl font-semibold shadow transition">
						Add to Favorites
					</button>
				</div>
			)}

			{/* favorites list */}
			<h2 className="text-2xl font-bold mb-4">Favorites</h2>
			<section className="flex flex-wrap gap-6">{favoriteWeathers.length > 0 ? favoriteWeathers.map(renderWeatherCard) : <p>No favorites yet.</p>}</section>
		</div>
	);
}
