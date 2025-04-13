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
			if (!userId) throw new AppError("User ID is required", 403);
			const listingId = req.params["id"];
			if (!listingId) throw new AppError("Listing ID is required", 400);
			const listing = await Listings.getListing(listingId);
			if (listing.userId !== userId)
				throw new AppError(
					"You are not authorized to upload an image for this listing",
					403
				);
			return { userId, listingId };
		})
		.onUploadComplete(async (data) => {
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
