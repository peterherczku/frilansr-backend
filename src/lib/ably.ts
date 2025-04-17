import Ably from "ably";

const ably = new Ably.Rest({
	key: process.env.ABLY_API_KEY,
});

export { ably };
