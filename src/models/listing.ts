import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const Listings = {
	async getListing(id) {
		return await prisma.listing.findFirst({
			where: {
				id,
				status: "PUBLISHED",
			},
		});
	},
	async createListing(userId: string) {
		return await prisma.listing.create({
			data: {
				userId: userId,
			},
		});
	},
	async updateListing(
		userId: string,
		listingId: string,
		data: Prisma.ListingUpdateInput
	) {
		return await prisma.listing.update({
			where: {
				id: listingId,
				userId: userId,
			},
			data,
		});
	},
	async publishListing(userId: string, listingId: string) {
		return await prisma.listing.update({
			where: {
				id: listingId,
				userId: userId,
			},
			data: {
				status: "PUBLISHED",
			},
		});
	},
	async hasDraft(userId: string) {
		const listing = await prisma.listing.findFirst({
			where: {
				userId,
				status: "DRAFT",
			},
		});
		return !!listing;
	},
	async getDraft(userId: string) {
		const listing = await prisma.listing.findFirst({
			where: {
				userId,
				status: "DRAFT",
			},
		});
		return listing;
	},
};

export { Listings };
