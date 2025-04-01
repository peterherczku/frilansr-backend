import { JobType, Prisma, Listing } from "@prisma/client";
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
	async searchListings(
		query: string,
		category: JobType | JobType[] | undefined,
		page: number,
		limit: number
	) {
		const where: Prisma.ListingWhereInput = {
			OR: [
				{
					title: {
						contains: query,
						mode: "insensitive",
					},
				},
				{
					description: {
						contains: query,
						mode: "insensitive",
					},
				},
			],
		};
		if (category) {
			where.type = {
				in: Array.isArray(category) ? category : [category],
			};
		}

		return await prisma.listing.findMany({
			where,
			skip: page * limit,
			take: limit,
			orderBy: {
				date: "desc",
			},
		});
	},
	async nearbyListings(
		longitude: number,
		latitude: number,
		radius: number
	): Promise<Listing[]> {
		return await prisma.$queryRaw`
			SELECT * FROM (
				SELECT *,
				6371 * acos(
					cos(radians(${latitude}))
					* cos(radians(latitude))
					* cos(radians(longitude) - radians(${longitude}))
					+ sin(radians(${latitude})) * sin(radians(latitude))
				) AS distance
				FROM "Listing"
			) AS subquery
			WHERE distance < ${radius} AND status = 'PUBLISHED'
			ORDER BY distance
		`;
	},
	async featuredListings() {
		return await prisma.listing.findMany({
			where: {
				status: "PUBLISHED",
			},
			take: 5,
			orderBy: {
				date: "desc",
			},
		});
	},
};

export { Listings };
