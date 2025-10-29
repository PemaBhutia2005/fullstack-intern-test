import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

// get favorites
export async function GET(request: Request) {
	const url = new URL(request.url);
	const username = url.searchParams.get("username");

	if (!username) {
		return NextResponse.json({ error: "Username required" }, { status: 400 });
	}

	if (!uri) return NextResponse.json({ error: "No URI found" }, { status: 500 });

	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db("skynow");
		const usersCollection = db.collection("users");

		// find the user
		const user = await usersCollection.findOne({ _id: username });

		// return the favorites array (or empty array if user not found)
		return NextResponse.json(user?.favorites || []);
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
	} finally {
		await client.close();
	}
}

// add favorite
export async function POST(request: Request) {
	const body = await request.json();
	const username = body.username;
	const city = body.city;

	if (!username || !city) {
		return NextResponse.json({ error: "Username and city required" }, { status: 400 });
	}

	if (!uri) return NextResponse.json({ error: "No URI found" }, { status: 500 });

	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db("skynow");
		const usersCollection = db.collection("users");

		// find user
		const user = await usersCollection.findOne({ _id: username });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// add city if it's not already in favorites
		if (!user.favorites.includes(city)) {
			user.favorites.push(city);
			await usersCollection.updateOne({ _id: username }, { $set: { favorites: user.favorites } });
		}

		return NextResponse.json({ message: `${city} added to favorites` });
	} catch (error) {
		return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
	} finally {
		await client.close();
	}
}
