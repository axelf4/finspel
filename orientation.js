define(function() {
	var x = 0, y = 0;
	if (window.DeviceOrientationEvent) window.addEventListener('deviceorientation', function(e) {
		x = e.gamma; // Left-to-right tilt in degrees where right is positive
		y = e.beta; // Front-to-back tilt in degrees where front is positive
	};
	return {
		x: x,
		y: y
	};
});
