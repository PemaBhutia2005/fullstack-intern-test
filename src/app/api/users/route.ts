import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export async function GET(request: Request) {
	const url = new URL(request.url);
	const username = url.searchParams.get("username"); // get username from query

	// check if username is provided
	if (!username) {
		return NextResponse.json({ error: "Username required" }, { status: 400 });
	}

	// check if uri is provided
	if (!uri) return NextResponse.json({ error: "No URI found" }, { status: 500 });

	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db("skynow");
		const usersCollection = db.collection("users");

		// find user by username
		const user = await usersCollection.findOne({ _id: username });

		// check if user exists, if not return a default user with empty favorites
		return NextResponse.json(user || { _id: username, favorites: [] });
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
	} finally {
		await client.close();
	}
}

export async function POST(request: Request) {
	const body = await request.json();
	const username = body.username;

	if (!username) {
		return NextResponse.json({ error: "Username required" }, { status: 400 });
	}

	if (!uri) return NextResponse.json({ error: "No URI found" }, { status: 500 });
	const client = new MongoClient(uri);

	try {
		await client.connect();
		const db = client.db("skynow");
		const usersCollection = db.collection("users");

		//check if user exists
		const userExists = await usersCollection.findOne({ _id: username });
		if (userExists) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 });
		} else {
			//if not, create new user with empty favorites
			await usersCollection.insertOne({
				_id: username,
				favorites: [],
			});
		}

		return NextResponse.json({ message: "User created" });
	} catch (error) {
		return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
	} finally {
		await client.close();
	}
}
