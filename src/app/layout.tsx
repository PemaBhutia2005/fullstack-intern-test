import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Link from "next/link";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

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
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{/* navigation */}
				<header className="bg-blue-400 text-white">
					<div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
						<h1>
							<Link href="/">SkyNow</Link>
						</h1>
						<nav className="space-x-4">
							<Link href="/" className="hover:text-gray-200">
								Home
							</Link>
							<Link href="/favorites" className="hover:text-gray-200">
								Favorites
							</Link>
						</nav>
					</div>
				</header>
				{/* page content */}
				<main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
				{/*ooter */}
				<footer className="text-center text-gray-600 py-4 border-t border-gray-200 mt-8">&copy; 2025 SkyNow. All rights reserved.</footer>
			</body>
		</html>
	);
}
