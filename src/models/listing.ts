import { prisma } from "../lib/prisma.js";

const Listings = {
	async getListing(id) {
		return await prisma.listing.findFirst({
			where: {
				id,
			},
		});
	},
};

export { Listings };
