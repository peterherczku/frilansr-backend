import { clerkClient } from "@clerk/express";
import { Listings } from "../models/listing.js";

export async function getListing(id: string) {
	const listing = await Listings.getListing(id);
	const user = await clerkClient.users.getUser(listing.userId);
	return {
		id: listing.id,
		title: listing.title,
		description: listing.description,
		salary: listing.salary,
		location: {
			longitude: listing.longitude,
			latitude: listing.latitude,
		},
		createdAt: listing.createdAt,
		user: {
			id: user.id,
			name: user.fullName,
		},
	};
}
