import { clerkClient, User } from "@clerk/express";
import { Listings } from "../models/listing.js";
import { AppError } from "../lib/error.js";
import { Application, Job, Listing } from "@prisma/client";
import {
	applyForListingSchema,
	jobTypeEnum,
	selectApplicationSchema,
	updateListingSchema,
} from "../lib/validators.js";
import app from "../app.js";
import { getJobWithWorker } from "./job.service.js";

export async function getListing(id: string) {
	const listing = await Listings.getListing(id);
	if (!listing) {
		throw new AppError("Listing not found", 404);
	}
	return await reduceListing(listing);
}

export async function createListing(userId: string) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "LISTER") {
		throw new AppError("You are not a job lister", 403);
	}
	const draft = await Listings.getDraft(userId);
	if (draft) {
		const draftListing = await reduceListingDraft(draft);
		return {
			created: false,
			draft: draftListing,
		};
	}
	const listing = await Listings.createListing(userId);
	const draftListing = await reduceListingDraft(listing);
	return {
		created: true,
		draft: draftListing,
	};
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
	if (listing.status === "DRAFT") {
		return await reduceListingDraft(listing);
	}
	return await reduceListing(listing);
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
	return reduceListing(listing);
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

export async function featuredListings() {
	const listings = await Listings.featuredListings();
	if (!listings) {
		throw new AppError("Listings not found", 404);
	}
	const listingsWithUser = await extendWithUser(listings);
	return listingsWithUser;
}

export async function applyForListing(
	userId: string,
	listingId: string,
	data: any
) {
	const user = await clerkClient.users.getUser(userId);
	if (user.publicMetadata.role !== "WORKER") {
		throw new AppError("You are not a worker", 403);
	}
	const hasApplied = await Listings.hasApplied(user.id, listingId);
	if (hasApplied) {
		throw new AppError("You have already applied for this listing", 400);
	}
	const listing = await Listings.getListing(listingId);
	if (!listing) {
		throw new AppError("Listing not found", 404);
	}
	if (listing.job !== null) {
		throw new AppError("This listing is already taken", 400);
	}
	const result = applyForListingSchema.safeParse(data);
	if (!result.success) {
		if (result.error.issues[0]) {
			throw new AppError(result.error.issues[0].message, 400);
		} else {
			throw new AppError("Invalid data", 400);
		}
	}
	await Listings.applyForListing(user.id, listingId, result.data.message);
	return true;
}

export async function getApplications(userId: string, listingId: string) {
	const listing = await Listings.getListing(listingId);
	if (listing.userId !== userId) {
		throw new AppError("You are not the owner of this listing", 403);
	}
	const applications = await Listings.getApplications(listingId);
	if (!applications) {
		throw new AppError("Applications not found", 404);
	}
	const applicationsWithUser = await extendApplicationsWithUser(applications);
	return applicationsWithUser;
}

export async function selectApplication(
	userId: string,
	listingId: string,
	data: any
) {
	const result = selectApplicationSchema.safeParse(data);
	if (!result.success) {
		if (result.error.issues[0]) {
			throw new AppError(result.error.issues[0].message, 400);
		} else {
			throw new AppError("Invalid data", 400);
		}
	}
	const applicationId = result.data.applicationId;
	const listing = await Listings.getListing(listingId);
	if (listing.userId !== userId) {
		throw new AppError("You are not the owner of this listing", 400);
	}
	const application = await Listings.getApplication(applicationId);
	if (application.listingId !== listingId) {
		throw new AppError("Application not found", 404);
	}
	if (listing.job !== null) {
		throw new AppError("This listing is already taken", 400);
	}
	const job = await Listings.selectApplication(application.userId, listingId);
	const listingWithUser = await reduceListing(job.listing);
	const jobWithUser = await getJobWithWorker(job);
	return {
		...jobWithUser,
		listing: listingWithUser,
	};
}

export async function reduceListing(listing: Listing) {
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
		type: listing.type,
		image: listing.image,
		date: listing.date,
		duration: listing.duration,
		user: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
	};
}

export async function reduceListingDraft(listing: Listing) {
	const user = await clerkClient.users.getUser(listing.userId);

	return {
		id: listing.id,
		user: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
		...(listing.title != null && { title: listing.title }),
		...(listing.description != null && { description: listing.description }),
		...(listing.salary != null && { salary: listing.salary }),
		...((listing.longitude != null || listing.latitude != null) && {
			location: {
				longitude: listing.longitude,
				latitude: listing.latitude,
			},
		}),
		...(listing.type != null && { type: listing.type }),
		...(listing.image != null && { image: listing.image }),
		...(listing.date != null && { date: listing.date }),
		...(listing.duration != null && { duration: listing.duration }),
	};
}

async function extendWithUser(listings: Listing[]) {
	const listingsWithUser = await Promise.all(listings.map(reduceListing));
	return listingsWithUser;
}

async function reduceApplication(application: Application) {
	const user = await clerkClient.users.getUser(application.userId);
	return {
		id: application.id,
		user: {
			id: user.id,
			name: user.fullName,
			imageUrl: user.imageUrl,
		},
		message: application.message,
	};
}

async function extendApplicationsWithUser(applications: Application[]) {
	const applicationsWithUser = await Promise.all(
		applications.map(reduceApplication)
	);
	return applicationsWithUser;
}
