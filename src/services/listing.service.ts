import { clerkClient } from "@clerk/express";
import { Listings } from "../models/listing.js";
import { AppError } from "../lib/error.js";
import { Listing } from "@prisma/client";
import { jobTypeEnum, updateListingSchema } from "../lib/validators.js";

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
			imageUrl: user.imageUrl,
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

export async function searchListing(
	query: string,
	category: string | string[] | undefined,
	limit: string,
	page: string
) {
	const result = jobTypeEnum.safeParse(category);
	const limitNum = Number(limit);
	const pageNum = Number(page);
	if (isNaN(limitNum)) {
		throw new AppError("Limit must be an integer", 400);
	}
	if (isNaN(pageNum)) {
		throw new AppError("Page must be an integer", 400);
	}
	if (!result.success) {
		throw new AppError("Invalid category", 400);
	}
	const listings = await Listings.searchListings(
		query,
		result.data,
		pageNum,
		limitNum
	);
	if (!listings) {
		throw new AppError("Listings not found", 404);
	}
	const listingsWithUser = await extendWithUser(listings);
	return listingsWithUser;
}

export async function nearbyListings(
	longitude: string,
	latitude: string,
	radius: number
) {
	const longitudeNum = Number(longitude);
	const latitudeNum = Number(latitude);
	if (isNaN(longitudeNum) || isNaN(latitudeNum)) {
		throw new AppError("Longitude and latitude must be numbers", 400);
	}
	const listings = await Listings.nearbyListings(
		longitudeNum,
		latitudeNum,
		radius
	);
	if (!listings) {
		throw new AppError("Listings not found", 404);
	}
	const listingsWithUser = await extendWithUser(listings);
	return listingsWithUser;
}

async function extendWithUser(listings: Listing[]) {
	const listingsWithUser = await Promise.all(
		listings.map(async (listing) => {
			const user = await clerkClient.users.getUser(listing.userId);
			return {
				...listing,
				user: {
					id: user.id,
					name: user.fullName,
					imageUrl: user.imageUrl,
				},
			};
		})
	);
	return listingsWithUser;
}
