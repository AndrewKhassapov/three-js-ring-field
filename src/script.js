/**
 * Variables and properties.
 */
const SCENE_SIZE = 1000; // Relative size to scale to.
const TOTAL = 40; // Number of items in ring field.

var scene = new THREE.Scene();
var clock = new THREE.Clock();
var camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	1,
	10000
);
camera.position.z = 1000;
scene.add(camera);

// Axis for testing.
function buildAxis() {
	var plane = new THREE.GridHelper(200, 10);
	scene.add(plane);
}
//buildAxis();

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);
document.getElementById("main-container").appendChild(renderer.domElement);

var items = []; // Circulating item properties.
var itemEffects = [];

/**
 * Item properties.
 */
class Item {
	#angle = 0; //Orbital angle in radians.

	constructor(
		mesh,
		radius,
		spin,
		velocity = new THREE.Vector3(1, 1, 1),
		ecliptic = new THREE.Vector3(1, 1, 1)
	) {
		this.mesh = mesh; // THREE.Mesh type
		this.radius = radius; // Vector3 type. Position.
		this.spin = spin; // Vector3 type
		this.velocity = velocity; // Float type.
		this.ecliptic = ecliptic; // Vector3 type. Variation in orbit by scale.
		this.#angle = Math.atan2(radius.y, radius.x); // Initial angle, in radians.
		this.initPosition(this.radius);
	}

	/**
	 * Update item shape.
	 */
	setShape(mesh) {
		this.mesh = mesh;
	}

	/**
	 * Sets initial position.
	 */
	initPosition(iPosition) {
		this.mesh.position.set(iPosition.x, iPosition.y, iPosition.z);
	}

	/**
	 * Rotate the mesh object over input time.
	 */
	rotateItem(dTime) {
		this.mesh.rotation.x += this.spin.x * dTime;
		this.mesh.rotation.y += this.spin.y * dTime;
		this.mesh.rotation.z += this.spin.z * dTime;
	}

	/**
	 * Rotation animation over the ellipse of object radius (x, y, z).
	 */
	animateRotation(dTime) {
		this.#angle += dTime * this.velocity;
		this.mesh.position.set(
			this.radius.length() * this.ecliptic.x * Math.cos(this.#angle),
			this.radius.length() * this.ecliptic.y * Math.sin(this.#angle),
			this.radius.z
		);
		if (this.#angle > Math.PI) {
			this.#angle = -Math.PI;
		}
	}

	/**
	 * Explosion and implosion animation over the ellipse of object radius (x, y, z).
	 */
	animateExplosion(dTime) {
		this.#angle += dTime * this.velocity;
		this.mesh.position.x +=
			this.radius.length() * this.ecliptic.x * dTime * Math.cos(this.#angle);
		this.mesh.position.y +=
			this.radius.length() * this.ecliptic.x * dTime * Math.sin(this.#angle);
		//this.mesh.position.z += this.radius.z * this.velocity.z * dTime; TODO z-axis motion.
		if (this.#angle > Math.PI) {
			this.#angle = -Math.PI;
		}
	}

	/**
	 * Rotate the mesh object over input time.
	 */
	rotateItem(dTime) {
		this.mesh.rotation.x += this.spin.x * dTime;
		this.mesh.rotation.y += this.spin.y * dTime;
		this.mesh.rotation.z += this.spin.z * dTime;
	}
}

/**
 * Generates a random color:
 * @return: Color in string 0x000000 format.
 */
function colorRandom() {
	return new THREE.Color(
		"0x" + Math.floor(Math.random() * 16777215).toString(16)
	);
}

/**
 * Generates an object-specific random color.
 * @return: Color in THREE.Color format.
 */
function colorObject() {
	let newColor = "hsl(" + mathRange(0, 360) + ", 100%, 50%)";
	return new THREE.Color(newColor);
}

/**
 * Generates an object-specific random color across the hue range.
 * Hue ranges from 0 (red), 120 (green), 240 (blue) to 360.
 * @return: Color in THREE.Color format.
 */
function colorObjectHue(hueInit, hueFinal, sat = 100, light = 50) {
	// Edge cases:
	hueInit = hueInit < 0 || hueInit > 360 ? 0 : Math.round(hueInit);
	hueFinal = hueFinal < 0 || hueFinal > 360 ? 360 : Math.round(hueFinal);
	sat = sat < 0 || sat > 100 ? (sat = 100) : Math.round(sat);
	light = light < 0 || light > 100 ? (light = 50) : Math.round(light);

	let newColor =
		"hsl(" + mathRange(hueInit, hueFinal) + ", " + sat + "%, " + light + "%)";
	return new THREE.Color(newColor);
}

/**
 * Generates a random position as Vector3(x, y, z).
 */
function randomPosition() {
	const MIN_DISTANCE = -SCENE_SIZE;
	const MAX_DISTANCE = SCENE_SIZE;
	//const RANGE_DISTANCE = 1.2; // Variation in position.
	function posRange() {
		return Math.random() * (MAX_DISTANCE - MIN_DISTANCE + 1) + MIN_DISTANCE;
	}
	let posX = posRange();
	let posY = posRange();
	return new THREE.Vector3(posX, posY, mathRange(-10, 10));
}

/**
 * A value between low (inclusive) and high (inclusive).
 * @returns A value between low (inclusive) and high (inclusive).
 */
function mathRange(low, high) {
	return Math.random() * (high - low + 1) + low;
}

/**
 * Generate number of items.
 */
function buildItems() {
	for (let i = 0; i < TOTAL; i++) {
		// Shapes
		/*let shapeGeometry = new THREE.BoxGeometry(
		mathRange(50, 150),
		mathRange(50, 150),
		mathRange(50, 150)
	);
	let shapeVelocity = (Math.random() * 0.25) + 0.25;*/
		//shapeGeometry = new THREE.IcosahedronGeometry(mathRange(25, 50), 0);
		//shapeGeometry = new THREE.TorusKnotGeometry( 50, 10, 100, 16 );
		let shapeGeometry = new THREE.TetrahedronGeometry(mathRange(50, 100), 0);

		let shapeMaterial = new THREE.MeshLambertMaterial({
			color: 0xffffff, //colorObjectHue(0, 360, 100, mathRange(80, 99)),
			emissive: 0xffffff,
			flatShading: false,
			wireframe: false
		});
		let shape = new THREE.Mesh(shapeGeometry, shapeMaterial);

		// Shape wireframe:
		let wfGeometry = new THREE.TetrahedronGeometry(
			shapeGeometry.parameters.radius * 1.5,
			shapeGeometry.parameters.detail
		);

		let wfMaterial = new THREE.MeshBasicMaterial({
			color: colorObjectHue(0, 360, 100, mathRange(50, 90)),
			///color: 0xffffff,
			flatShading: false,
			wireframe: true
		});
		let wireframe = new THREE.Mesh(wfGeometry, wfMaterial);

		scene.add(shape);
		scene.add(wireframe);

		let shapeVelocity = 0.25 + Math.random() * 0.25;
		let shapePosition = randomPosition();
		let shapeRadii = new THREE.Vector3(
			(1.2 * window.innerWidth) / SCENE_SIZE,
			(1.2 * window.innerHeight) / SCENE_SIZE,
			1
		);
		let shapeSpin = new THREE.Vector3(
			Math.random(),
			Math.random(),
			Math.random()
		);
		let shapeItem = new Item(
			shape,
			shapePosition,
			shapeSpin,
			shapeVelocity,
			shapeRadii
		);
		let wireframeItem = new Item(
			wireframe,
			shapePosition,
			shapeSpin,
			shapeVelocity,
			shapeRadii
		);

		items.push(shapeItem);
		itemEffects.push(wireframeItem);
	}
}
buildItems();

/**
Skybox,
*/
function buildSkybox() {
	var skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
	var skyboxMaterial = new THREE.MeshBasicMaterial({
		color: 0x000000,
		side: THREE.BackSide
	});
	var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
	scene.add(skybox);
}
// buildSkybox();

function buildLight() {
	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 0, 10000);
	scene.add(pointLight);
}
buildLight();

/**
 * Render animation.
 */
function render() {
	requestAnimationFrame(render);
	let delta = clock.getDelta();

	for (var i = 0; i < TOTAL; i++) {
		items[i].rotateItem(delta);
		items[i].animateRotation(delta);
		itemEffects[i].rotateItem(delta);
		itemEffects[i].animateRotation(delta);
	}

	renderer.render(scene, camera);
}

render();
