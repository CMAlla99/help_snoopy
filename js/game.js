
var scene, camera, renderer, clock, deltaTime, totalTime;

var arToolkitSource, arToolkitContext;

var markerRoot1;

var mesh1;

// 3D Models
const loader = new THREE.GLTFLoader();
loader.setPath( 'models/' );

initialize();
animate();

function initialize()
{
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
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'absolute'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;
	
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

	let geometry1 = new THREE.PlaneBufferGeometry(1,1, 4,4);
	let loader = new THREE.TextureLoader();

	let material1 = new THREE.MeshBasicMaterial( { color: 0x0000ff, opacity: 0.5 } );
	mesh1 = new THREE.Mesh( geometry1, material1 );
	mesh1.rotation.x = -Math.PI/2;
	markerRoot1.add( mesh1 );
	
	function onProgress(xhr) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); }
	function onError(xhr) { console.log( 'An error happened' ); }
	

    createCanoe();
}


function createSnoopy(){

loader.load(
  // resource URL
  'snoopy.glb',
  // called when the resource is loaded
  function ( gltf ) {
    
    const snoopy = gltf.scene;
    //const mesh = canoe.children[1];
    snoopy.scale.set(180.,180.,180.);
    snoopy.rotation.y = 45;
    snoopy.position.x = -15;
    snoopy.position.y = -17;
    canoe.add(snoopy);

  },
  // called while loading is progressing
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% Snoopy loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log( 'An error happened' );
  });
}

function createWoodstock(){

loader.load(
  // resource URL
  'woodstock.glb',
  // called when the resource is loaded
  function ( gltf ) {
    
    const woodstock = gltf.scene;
    //const mesh = canoe.children[1];
    woodstock.scale.set(16.,16.,16.);
    woodstock.rotation.y = 45;
    woodstock.position.x = 35;
    woodstock.position.y = 35;
    canoe.add(woodstock);

  },
  // called while loading is progressing
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% Woodstock loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log( 'An error happened' );
  });
}

function createCanoe(){

loader.load(
  // resource URL
  'canoe.glb',
  // called when the resource is loaded
  function ( gltf ) {
    
    canoe = gltf.scene;
    canoe.scale.set(.25,.25,.25);
    canoe.position.y = 50;

    createSnoopy();
    //createWoodstock();

    scene.add(canoe);

    //loop();
  },
  // called while loading is progressing
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% Canon loaded' );
  },
  // called when loading has errors
  function ( error ) {
    console.log( 'An error happened' );
  });
}



function update()
{
	// update artoolkit on every frame
	if ( arToolkitSource.ready !== false )
		arToolkitContext.update( arToolkitSource.domElement );
}


function render()
{
	renderer.render( scene, camera );
}


function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime += deltaTime;
	update();
	render();
}