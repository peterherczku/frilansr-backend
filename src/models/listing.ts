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
			job: {
				is: null,
			},
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
			WHERE distance < ${radius} AND status = 'PUBLISHED AND job IS NULL'
			ORDER BY distance
		`;
	},
	async featuredListings() {
		return await prisma.listing.findMany({
			where: {
				status: "PUBLISHED",
				job: {
					is: null,
				},
			},
			take: 5,
			orderBy: {
				date: "desc",
			},
		});
	},
	async applyForListing(
		workedUserId: string,
		listingId: string,
		message?: string
	) {
		return await prisma.application.create({
			data: {
				listingId,
				userId: workedUserId,
				message,
			},
		});
	},
	async hasApplied(userId: string, listingId: string) {
		const application = await prisma.application.findFirst({
			where: {
				listingId,
				userId,
			},
		});
		return !!application;
	},
	async getApplication(applicationId: string) {
		return await prisma.application.findFirst({
			where: {
				id: applicationId,
			},
		});
	},
	async getApplications(listingId: string) {
		return await prisma.application.findMany({
			where: {
				listingId,
			},
		});
	},
	async selectApplication(workerId: string, listingId: string) {
		return await prisma.job.create({
			data: {
				listingId,
				workerId: workerId,
			},
			include: {
				listing: true,
			},
		});
	},
};

export { Listings };
