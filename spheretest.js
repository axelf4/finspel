define(["three"], function(THREE) {
	// Return true if r1 and r2 are real
	var quadraticFormula = function(a, b, c) {
		return (b * b - 4 * a * c) >= 0;
	};
	var sphereSphereSweep = function(ra, A0, A1, rb, B0, B1) {
		var va = new THREE.Vector2().subVectors(A1, A0);
		var vb = new THREE.Vector2().subVectors(B1, B0);
		var AB = new THREE.Vector2().subVectors(B0, A0);
		var vab = new THREE.Vector2().subVectors(vb, va);
		var rab = ra + rb;
		var a = vab.dot(vab);
		var b = 2 * vab.dot(AB);
		var c = AB.dot(AB) - rab * rab;
		if (AB.dot(AB) <= rab * rab) return true;
		if (quadraticFormula(a, b, c)) return true;
		return false;
	};
	return {
		sphereSphereSweep: sphereSphereSweep
	};
});
