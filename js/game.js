
//https://github.com/AR-js-org/AR.js/tree/master/three.js/examples
//https://stemkoski.github.io/AR-Examples/

//COLORS
let Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,

};

///////////////

// GAME VARIABLES
let game;
let deltaTime = 0;
let totalTime = 0;
let newTime = new Date().getTime();
let oldTime = new Date().getTime();
let ennemiesPool = [];
let particlesPool = [];
let particlesInUse = [];
let woodstock;
let sea;
let canoe;
let mesh2;
let rotation_woodstock = false;
let keyboard = new Keyboard();
let min = 2;
let max = 4;

function resetGame(){
  game = {speed:0,
          initSpeed:.00035,
          baseSpeed:.00035,
          targetBaseSpeed:.00035,
          incrementSpeedByTime:.0000025,
          incrementSpeedByLevel:.000005,
          distanceForSpeedUpdate:100,
          speedLastUpdate:0,

          distance:0,
          ratioSpeedDistance:50,
          energy:100,
          ratioSpeedEnergy:3,

          level:1,
          levelLastUpdate:0,
          distanceForLevelUpdate:1000,

          planeDefaultHeight:50,
          planeAmpHeight:80,
          planeAmpWidth:75,
          planeMoveSensivity:0.005,
          planeRotXSensivity:0.0008,
          planeRotZSensivity:0.0004,
          planeFallSpeed:.001,
          planeMinSpeed:1,
          planeMaxSpeed:1.4,
          planeSpeed:0,
          planeCollisionDisplacementX:0,
          planeCollisionSpeedX:0,

          planeCollisionDisplacementY:0,
          planeCollisionSpeedY:0,

          seaRadius:1000,
          seaLength:800,
          //seaRotationSpeed:0.006,
          wavesMinAmp : 5,
          wavesMaxAmp : 20,
          wavesMinSpeed : 0.001,
          wavesMaxSpeed : 0.003,

          cameraFarPos:500,
          cameraNearPos:150,
          cameraSensivity:0.002,

          coinDistanceTolerance:15,
          coinValue:3,
          coinsSpeed:.5,
          coinLastSpawn:0,
          distanceForCoinsSpawn:100,

          ennemyDistanceTolerance:10,
          ennemyValue:10,
          ennemiesSpeed:.6,
          ennemyLastSpawn:0,
          distanceForEnnemiesSpawn:50,

          status : "playing",
         };
}

//THREEJS RELATED VARIABLES
let scene,
	camera,
	renderer,
	clock;

let arToolkitSource, arToolkitContext;

let markerRoot1;
let markerRoot2;


//SCREEN & MOUSE VARIABLES

let HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };


// MOUSE AND SCREEN EVENTS

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
}

////////////////////////////////////////////////////////////
// Game
/////////////////////////
function createScene()
{
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	scene = new THREE.Scene();

	let ambientLight = new THREE.AmbientLight( 0xcccccc, 1.0 );
	scene.add( ambientLight );
				
	camera = new THREE.Camera();
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({
		antialias : true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( WIDTH, HEIGHT );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	
	////////////////////////////////////////////////////////////
	// setup arToolkitSource
	////////////////////////////////////////////////////////////

	arToolkitSource = new THREEx.ArToolkitSource({
		sourceType : 'webcam',
	});

	function onResize()
	{
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if ( arToolkitContext.arController !== null )
		{
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

	arToolkitSource.init(function onReady(){
		onResize()
	});
	
	// handle resize event
	window.addEventListener('resize', function(){
		onResize()
	});
	
	////////////////////////////////////////////////////////////
	// setup arToolkitContext
	////////////////////////////////////////////////////////////	

	// create atToolkitContext
	arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl: 'data/camera_para.dat',
		detectionMode: 'mono'
	});
	
	// copy projection matrix to camera when initialization complete
	arToolkitContext.init( function onCompleted(){
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	});

	////////////////////////////////////////////////////////////
	// setup markerRoots
	////////////////////////////////////////////////////////////

	// build markerControls
	markerRoot1 = new THREE.Group();
	scene.add(markerRoot1);
	let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
		type: 'pattern', patternUrl: "data/hiro.patt",
	})

	// Create the sea
	let geometry1 = new THREE.PlaneBufferGeometry(1,1, 4,4);
	let loader = new THREE.TextureLoader();

	let material1 = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.5 } );
	sea = new THREE.Mesh( geometry1, material1 );
	sea.rotation.x = -Math.PI/2;
	markerRoot1.add( sea );
	
	function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }

	let mtlloader = new THREE.MTLLoader().setPath( 'models/' )

	// Create the canoe

	mtlloader.load( 'canoe.mtl', function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/' )
				.load( 'canoe.obj', function ( group ) {
					canoe = group.children[0];
					canoe.material.side = THREE.DoubleSide;
					canoe.position.y = 0.25;
					canoe.position.z = 0;
					canoe.position.x = 0;
					canoe.scale.set(.002,.002,.002);
					markerRoot1.add(canoe);

				}, onProgress, onError );
		});

	mtlloader.load( 'woodstock.mtl', function ( materials ) {
			materials.preload();
			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/' )
				.load( 'woodstock.obj', function ( group ) {
					woodstock = group.children[0];
					woodstock.material.side = THREE.DoubleSide;
					woodstock.position.y = 0.4;
					woodstock.position.z = 0;
					woodstock.position.x = 0;
					woodstock.scale.set(0.08,0.08,0.08);
					markerRoot1.add(woodstock);

					createEnnemy();
					markerRoot1.add( mesh2 );

					square();
					
					animate();

				}, onProgress, onError );
		});

	window.addEventListener('resize', handleWindowResize, false);
}

function square() {

	for (let i=0; i < 200; i++) {
		let geometry1	= new THREE.CubeGeometry(0.1,0.1,0.1);
		let material1	= new THREE.MeshNormalMaterial({
			transparent: true,
			opacity: 0.5,
			side: THREE.DoubleSide
		}); 
		
		let mesh3 = new THREE.Mesh( geometry1, material1 );
		mesh3.position.y = Math.random() * 10 - 5;
		mesh3.position.x = Math.random() * 10 - 5;
		mesh3.position.z = Math.random() * 10 - 5;

		mesh3.rotation.x = Math.random() * 2 * Math.PI;
		mesh3.rotation.y = Math.random() * 2 * Math.PI;
		mesh3.rotation.z = Math.random() * 2 * Math.PI;

		particlesPool.push(mesh3);
		markerRoot1.add(mesh3);
	}

}

function createEnnemy() {
	let geometry2	= new THREE.SphereGeometry( 0.05, 32, 16 );
	let material2 = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
					
	mesh2 = new THREE.Mesh( geometry2, material2 );
	mesh2.position.y = Math.random() * (max - min) + min;
	mesh2.position.z = Math.random() * (max - min) + min;

}

function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}

function rotation() {
	rotation_woodstock = !rotation_woodstock;
}


function animate()
{

	newTime = new Date().getTime();
	deltaTime = newTime-oldTime;
	oldTime = newTime;

	keyboard.update();
	
	if ( markerRoot1.visible ) {

		if (rotation_woodstock) {
			woodstock.rotation.x += 0.1;
		} else {
			woodstock.rotation.x = 0;
			woodstock.rotation.y = 0;
		}
	
		if (keyboard.isKeyPressed("Space")) {
			rotation_woodstock = !rotation_woodstock;
		}

		for (let i=0; i < particlesPool.length; i++) {
			particlesPool[i].rotation.x += 0.03;
		}

		if (mesh2.position.y >= 0.25) {
			mesh2.position.y -= 0.01;
		}
		if (mesh2.position.z >= 0) {
			mesh2.position.z -= 0.01;
		}

		if (mesh2.position.y <= 0.25 && mesh2.position.x <= 0) {
			mesh2.position.y = Math.random() * (max - min) + min;
			mesh2.position.z = Math.random() * (max - min) + min;
		}
		
	}  

	requestAnimationFrame(animate);
	update();
	renderer.render( scene, camera );
}


function init(event){
  
	resetGame();
	createScene();

  }

window.addEventListener('touchend', rotation, false);
window.addEventListener('load', init, false);