//////////////////////////////////////////////////////////////////////////////
//
//  For instantiating the scene models.
//
//  J. Madeira - November 2018
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Constructors
//


function emptyModelFeatures() {

	// EMPTY MODEL

	this.vertices = [];

	this.normals = [];

	// Transformation parameters

	// Displacement vector
	
	this.tx = 0.0;
	
	this.ty = 0.0;
	
	this.tz = 0.0;	
	
	// Rotation angles	
	
	this.rotAngleXX = 0.0;
	
	this.rotAngleYY = 0.0;
	
	this.rotAngleZZ = 0.0;	

	// Scaling factors
	
	this.sx = 1.0;
	
	this.sy = 1.0;
	
	this.sz = 1.0;		
	
	// Animation controls
	
	this.rotXXOn = false;
	
	this.rotYYOn = false;
	
	this.rotZZOn = false;
	
	this.rotXXSpeed = 1.0;
	
	this.rotYYSpeed = 1.0;
	
	this.rotZZSpeed = 1.0;
	
	this.rotXXDir = 1;
	
	this.rotYYDir = 1;
	
	this.rotZZDir = 1;
	
	// Material features
	
	this.kAmbi = [ 0.2, 0.2, 0.2 ];
	
	this.kDiff = [ 0.7, 0.7, 0.7 ];

	this.kSpec = [ 0.7, 0.7, 0.7 ];

	this.nPhong = 100;
}

function singleTriangleModel( ) {
	
	var triangle = new emptyModelFeatures();
	
	// Default model has just ONE TRIANGLE

	triangle.vertices = [

		// FRONTAL TRIANGLE
		 
		-0.5, -0.5,  0.5,
		 
		 0.5, -0.5,  0.5,
		 
		 0.5,  0.5,  0.5,
	];

	triangle.normals = [

		// FRONTAL TRIANGLE
		 
		 0.0,  0.0,  1.0,
		 
		 0.0,  0.0,  1.0,
		 
		 0.0,  0.0,  1.0,
	];

	return triangle;
}


function simpleCubeModel( ) {
	
	var cube = new emptyModelFeatures();
	
	cube.vertices = [

		-1.000000, -1.000000,  1.000000, 
		 1.000000,  1.000000,  1.000000, 
		-1.000000,  1.000000,  1.000000, 
		-1.000000, -1.000000,  1.000000,
		 1.000000, -1.000000,  1.000000, 
		 1.000000,  1.000000,  1.000000, 
         1.000000, -1.000000,  1.000000, 
		 1.000000, -1.000000, -1.000000, 
		 1.000000,  1.000000, -1.000000, 
         1.000000, -1.000000,  1.000000, 
         1.000000,  1.000000, -1.000000, 
         1.000000,  1.000000,  1.000000, 
        -1.000000, -1.000000, -1.000000, 
        -1.000000,  1.000000, -1.000000,
         1.000000,  1.000000, -1.000000, 
        -1.000000, -1.000000, -1.000000, 
         1.000000,  1.000000, -1.000000, 
         1.000000, -1.000000, -1.000000, 
        -1.000000, -1.000000, -1.000000, 
		-1.000000, -1.000000,  1.000000, 
		-1.000000,  1.000000, -1.000000, 
		-1.000000, -1.000000,  1.000000, 
		-1.000000,  1.000000,  1.000000, 
		-1.000000,  1.000000, -1.000000, 
		-1.000000,  1.000000, -1.000000, 
		-1.000000,  1.000000,  1.000000, 
		 1.000000,  1.000000, -1.000000, 
		-1.000000,  1.000000,  1.000000, 
		 1.000000,  1.000000,  1.000000, 
		 1.000000,  1.000000, -1.000000, 
		-1.000000, -1.000000,  1.000000, 
		-1.000000, -1.000000, -1.000000,
		 1.000000, -1.000000, -1.000000, 
		-1.000000, -1.000000,  1.000000, 
		 1.000000, -1.000000, -1.000000, 
		 1.000000, -1.000000,  1.000000, 	 
	];

	computeVertexNormals( cube.vertices, cube.normals );

	return cube;
}


function cubeModel( subdivisionDepth = 0 ) {
	
	var cube = new simpleCubeModel();
	
	midPointRefinement( cube.vertices, subdivisionDepth );
	
	computeVertexNormals( cube.vertices, cube.normals );
	
	return cube;
}


function simpleTetrahedronModel( ) {
	
	var tetra = new emptyModelFeatures();
	
	tetra.vertices = [

		-1.000000,  0.000000, -0.707000, 
         0.000000,  1.000000,  0.707000, 
         1.000000,  0.000000, -0.707000, 
         1.000000,  0.000000, -0.707000, 
         0.000000,  1.000000,  0.707000, 
         0.000000, -1.000000,  0.707000, 
        -1.000000,  0.000000, -0.707000, 
         0.000000, -1.000000,  0.707000, 
         0.000000,  1.000000,  0.707000, 
        -1.000000,  0.000000, -0.707000, 
         1.000000,  0.000000, -0.707000, 
         0.000000, -1.000000,  0.707000,
	];

	computeVertexNormals( tetra.vertices, tetra.normals );

	return tetra;
}


function tetrahedronModel( subdivisionDepth = 0 ) {
	
	var tetra = new simpleTetrahedronModel();
	
	midPointRefinement( tetra.vertices, subdivisionDepth );
	
	computeVertexNormals( tetra.vertices, tetra.normals );
	
	return tetra;
}


function sphereModel( subdivisionDepth = 5 ) {
	
	var sphere = new simpleCubeModel();
	
	midPointRefinement( sphere.vertices, subdivisionDepth );
	
	moveToSphericalSurface( sphere.vertices )
	
	computeVertexNormals( sphere.vertices, sphere.normals );

	return sphere;
}

// Turns out this makes an egg
function CilinderModel( subdivisionDepth = 5,aux ) {
	
	//var cilinder = new simpleCubeModel();
	
	midPointRefinement( aux.vertices, subdivisionDepth );
	
	moveToSphericalSurface( aux.vertices )
	
	computeVertexNormals( aux.vertices, aux.normals );

	return aux;
}



function piramidModel(){
	var pira = new emptyModelFeatures();

	var h = Math.sqrt(2) / 2;
	pira.vertices = [
	// Bottom
	-h, -h, h, // left bottom front
	0.0, -h, -h, // center bottom back
	h, -h, h, // right bottom front

	// front
	-h, -h, h, // left bottom front
	h, -h, h, // right bottom front
	0.0, h, 0.0, // center top center

	// right
	h, -h, h, // right bottom front
	0.0, -h, -h, // center bottom back
	0.0, h, 0.0, // center top center

	// left
	-h, -h, h, // left bottom front
	0.0, h, 0.0, // center top center
	0.0, -h, -h // center bottom back
	];

	computeVertexNormals(pira.vertices,pira.normals);
	return pira;

}
function coneModel(){
	var cone = new emptyModelFeatures();
	cone.vertices =[
	1.5, 0, 0, 
	-1.5, 1, 0, 
	-1.5, 0.809017,	0.587785,
	-1.5, 0.309017,	0.951057, 
	-1.5, -0.309017, 0.951057, 
	-1.5, -0.809017, 0.587785,
	-1.5, -1, 0, 
	-1.5, -0.809017, -0.587785,
	-1.5, -0.309017, -0.951057, 
	-1.5, 0.309017,	-0.951057, 
	-1.5, 0.809017,	-0.587785];
	
	computeVertexNormals(cone.vertices,cone.normals);
	return cone;
}




//----------------------------------------------------------------------------
//
//  Instantiating scene models
//

// I identify as a room
var sceneModels = [];
sceneModels.push( new cubeModel() );

sceneModels[0].tx = 0; sceneModels[0].ty = 0;sceneModels[0].tz = -1.6;
sceneModels[0].sx = 2.5; 
sceneModels[0].sy = 1.6
sceneModels[0].sz = 10;

// Center sphere
sceneModels.push( new sphereModel( 5 ) );

sceneModels[1].sx = 0.25; sceneModels[1].sy = 0.25; sceneModels[1].sz = 0.25;
sceneModels[1].tx = 0; sceneModels[1].ty = 0;sceneModels[1].tz = 0;

// Side spheres
sceneModels.push( new sphereModel( 5 ) );

sceneModels[2].tx = 0.5; sceneModels[2].ty = 0;sceneModels[2].tz = 0;
sceneModels[2].sx = sceneModels[2].sy = sceneModels[2].sz = 0.15;


sceneModels.push( new sphereModel( 5 ) );

sceneModels[3].tx = -0.5; sceneModels[3].ty = 0;sceneModels[3].tz = 0;
sceneModels[3].sx = sceneModels[3].sy = sceneModels[3].sz = 0.15;


/*
aux= new simpleCubeModel();
aux.sx = 0.5;
aux.sy = 0.5;
aux.sz = 1;

sceneModels.push(new CilinderModel(4,aux));
sceneModels[4].tx = -0.5; sceneModels[4].ty = -1;sceneModels[4].tz = -2.5;

sceneModels.push( new sphereModel( 3 ) );

sceneModels[4].tx = 0.5; sceneModels[4].ty = -1;sceneModels[4].tz = 0;
sceneModels[4].sx = sceneModels[4].sy = sceneModels[4].sz = 0.15;

sceneModels.push( new sphereModel( 5 ) );

sceneModels[5].tx = -0.5; sceneModels[5].ty = -1;sceneModels[5].tz = 0;
sceneModels[5].sx = sceneModels[5].sy = sceneModels[5].sz = 0.15;

sceneModels.push( new sphereModel(1) );

sceneModels[6].tx = -0.5; sceneModels[6].ty = 0;sceneModels[6].tz = -5;
sceneModels[6].sx = sceneModels[6].sy = sceneModels[6].sz = 0.15;
*/
	


