export function jitterLocation(lat, lng, radius) {
	const toRad = (x) => (x * Math.PI) / 180;
	const toDeg = (x) => (x * 180) / Math.PI;
	const R_earth = 6371000; // m

	// random bearing
	const θ = Math.random() * 2 * Math.PI;
	// random radius with uniform area density
	const u = Math.random();
	const d = radius * Math.sqrt(u);

	// angular distance
	const δ = d / R_earth;

	const φ1 = toRad(lat);
	const λ1 = toRad(lng);

	const φ2 = Math.asin(
		Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
	);
	const λ2 =
		λ1 +
		Math.atan2(
			Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
			Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
		);

	return [toDeg(φ2), ((toDeg(λ2) + 540) % 360) - 180];
}
