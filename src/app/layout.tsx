import type { Metadata } from "next";
import "../styles/globals.css";
import Link from "next/link";
import NavBar from "./components/NavBar";

export const metadata: Metadata = {
	title: "SkyNow - Real-Time Weather Worldwide",
	description: "Get the current weather conditions for any city worldwide.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`antialiased`}>
				<NavBar />
				{/* page content */}
				<main className="p-6">{children}</main>
				{/*footer */}
				<footer className="text-center text-gray-600 py-4 border-t border-gray-200 mt-8">&copy; 2025 SkyNow. All rights reserved.</footer>
			</body>
		</html>
	);
}
