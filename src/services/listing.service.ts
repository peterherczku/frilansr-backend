import { clerkClient } from "@clerk/express";
import { Listings } from "../models/listing.js";
import { AppError } from "../lib/error.js";
import { Prisma } from "@prisma/client";
import { updateListingSchema } from "../lib/validators.js";

export async function getListing(id: string) {
	const listing = await Listings.getListing(id);
	if (!listing) {
		throw new AppError("Listing not found", 404);
	}
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

export async function createListing(userId: string) {
	const hasDraft = await Listings.hasDraft(userId);
	if (hasDraft) {
		throw new AppError(
			"You already have a draft listing. Please publish it first.",
			400
		);
	}
	const listing = await Listings.createListing(userId);
	return listing.id;
}

export async function updateListing(
	userId: string,
	listingId: string,
	data: any
) {
	const result = updateListingSchema.safeParse(data);
	if (!result.success) {
		if (result.error.issues[0]) {
			throw new AppError(result.error.issues[0].message, 400);
		} else {
			throw new AppError("Invalid data", 400);
		}
	}
	const listing = await Listings.updateListing(userId, listingId, result.data);
	if (!listing) {
		throw new AppError("Listing not found", 404);
	}
	return listing;
}

export async function publishListing(userId: string, listingId: string) {
	const draft = await Listings.getDraft(userId);
	if (!draft) {
		throw new AppError(
			"You don't have a draft listing. Please create one first.",
			400
		);
	}
	if (
		!draft.duration ||
		!draft.description ||
		!draft.image ||
		!draft.latitude ||
		!draft.longitude ||
		!draft.salary ||
		!draft.title ||
		!draft.type ||
		!draft.date
	) {
		throw new AppError("Please fill all the fields", 400);
	}
	const listing = await Listings.publishListing(userId, listingId);
	return listing;
}
