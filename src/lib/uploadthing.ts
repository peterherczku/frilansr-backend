import { getAuth } from "@clerk/express";
import { createUploadthing, type FileRouter } from "uploadthing/express";
import { AppError } from "./error.js";
import { Listings } from "../models/listing.js";
import {
	reduceListing,
	reduceListingDraft,
} from "../services/listing.service.js";

const f = createUploadthing();

export const uploadRouter = {
	listingImageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		.middleware(async ({ req }) => {
			const { userId } = getAuth(req);
			if (!userId) {
				console.log("no user id");
				throw new AppError("User ID is required", 403);
			}
			const listingId = req.headers["x-listing-id"] as string;
			if (!listingId) {
				console.log("no listing id");
				throw new AppError("Listing ID is required", 400);
			}
			const listing = await Listings.getListingOrDraft(listingId);
			if (!listing) {
				throw new AppError("Listing not found", 404);
			}
			if (listing.userId !== userId) {
				console.log("last error");
				throw new AppError(
					"You are not authorized to upload an image for this listing",
					403
				);
			}
			return { userId, listingId };
		})
		.onUploadComplete(async (data) => {
			console.log("a");
			const listing = await Listings.updateListing(
				data.metadata.userId,
				data.metadata.listingId,
				{
					image: data.file.ufsUrl,
				}
			);
			if (listing.status === "DRAFT") {
				return await reduceListingDraft(listing);
			}
			return await reduceListing(listing);
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
