"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NavBar() {
	const [username, setUsername] = useState<string | null>(null);
	const [showLogin, setShowLogin] = useState(false);
	const [inputName, setInputName] = useState("");

	useEffect(() => {
		const saved = localStorage.getItem("skynowUsername");
		if (saved) setUsername(saved);
	}, []);

	const handleLogin = async () => {
		if (!inputName.trim()) return;

		await fetch("/api/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: inputName }),
		});

		localStorage.setItem("skynowUsername", inputName.trim());
		setUsername(inputName.trim());
		setShowLogin(false);
		setInputName("");
	};

	const handleLogout = () => {
		localStorage.removeItem("skynowUsername");
		setUsername(null);
	};

	return (
		<>
			<nav className="flex justify-between items-center bg-blue-500 text-white px-6 py-4">
				<h1 className="text-2xl font-bold">
					<Link href="/">SkyNow</Link>
				</h1>

				<div className="flex items-center space-x-4">
					{username ? (
						<>
							<span>Hello, {username}</span>
							<button onClick={handleLogout} className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-700">
								Logout
							</button>
						</>
					) : (
						<button onClick={() => setShowLogin(true)} className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-700">
							Log in / Sign up
						</button>
					)}
				</div>
			</nav>

			{showLogin && (
				<div className="fixed inset-0 bg-gray-800/50 flex justify-center items-center">
					<div className="bg-white p-6 rounded-lg w-80">
						<h2 className="text-xl font-semibold mb-4">Log in to SkyNow</h2>
						<input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Enter your username" className="border w-full px-2 py-1 rounded mb-3" />
						<div className="flex justify-end space-x-2">
							<button onClick={() => setShowLogin(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-400">
								Cancel
							</button>
							<button onClick={handleLogin} className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-900">
								Log in
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
