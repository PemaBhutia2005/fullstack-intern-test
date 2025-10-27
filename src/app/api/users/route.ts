import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export async function GET(request: Request) {
	const username = "demoUser"; // placeholder
	if (!uri) return NextResponse.json({ error: "No URI found" }, { status: 500 });

	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db("skynow");
		const usersCollection = db.collection("users");

		// find user by username
		const user = await usersCollection.findOne({ _id: username });

		// check if user exists, if not return a default user with empty favorites
		if (user) {
			return NextResponse.json(user);
		} else {
			return NextResponse.json({ _id: username, favorites: [] });
		}
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
	} finally {
		await client.close();
	}
}

export async function POST(request: Request) {
	const username = "demoUser"; // placeholder
	if (!uri) return NextResponse.json({ error: "No URI found" }, { status: 500 });

	const client = new MongoClient(uri);
	const body = await request.json();
	const favorites = body.favorites || [];

	try {
		await client.connect();
		const db = client.db("skynow");
		const usersCollection = db.collection("users");

		//create new user
		await usersCollection.insertOne({
			_id: username,
			favorites: favorites,
		});
		return NextResponse.json({ message: "User created" });
	} catch (error) {
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	} finally {
		await client.close();
	}
}
