//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_24_GPU_per_vertex.js 
//
//  Phong Illumination Model on the GPU - Per vertex shading - Several light sources
//
//  Reference: E. Angel examples
//
//  J. Madeira - November 2017 + November 2018
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context

var shaderProgram = null;

var triangleVertexPositionBuffer = null;
	
var triangleVertexNormalBuffer = null;	

// The GLOBAL transformation parameters

var globalAngleXX = 0.0;
var globalAngleYY = 0.0;
var globalAngleZZ = 0.0;
var globalTz = 0.0;

// GLOBAL Animation controls

var globalRotationXX_ON = 0;
var globalRotationXX_DIR = 1;
var globalRotationXX_SPEED = 1;

var globalRotationYY_ON = 0;
var globalRotationYY_DIR = 1;
var globalRotationYY_SPEED = 1;

var globalRotationZZ_ON = 0;
var globalRotationZZ_DIR = 1;
var globalRotationZZ_SPEED = 1;

// Added stuff


lightSources[1].isOn = false;
lightSources[2].isOn = false;




// Texture buffers


var triangleVertexTextureCoordBuffer;


// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = 1;

var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];


//----------------------------------------------------------------------------
//
// NEW - To count the number of frames per second (fps)
//

var elapsedTime = 0;

var frameCount = 0;

var lastfpsTime = new Date().getTime();;


function countFrames() {
	
   var now = new Date().getTime();

   frameCount++;
   
   elapsedTime += (now - lastfpsTime);

   lastfpsTime = now;

   if(elapsedTime >= 1000) {
	   
       fps = frameCount;
       
       frameCount = 0;
       
       elapsedTime -= 1000;
	   
	   document.getElementById('fps').innerHTML = 'fps:' + fps;
   }
}


//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex Coordinates and the Vertex Normal Vectors

function initBuffers( model ) {	
	
	// Vertex Coordinates
		
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems =  model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Vertex Normal Vectors
		
	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( model.normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = model.normals.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
			triangleVertexNormalBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);	
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( model,
					mvMatrix,
					primitiveType ) {

	// The the global model transformation is an input
	
	// Concatenate with the particular model transformations
	
    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( model.rotAngleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( model.rotAngleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( model.rotAngleXX ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    
	// Associating the data to the vertex shader
	
	// This can be done in a better way !!

	// Vertex Coordinates and Vertex Normal Vectors
	
	initBuffers(model);
	
	// Material properties
	
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), 
		flatten(model.kAmbi) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
        flatten(model.kDiff) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(model.kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		model.nPhong );

    // Light Sources
	
	var numLights = lightSources.length;
	
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );

	//Light Sources
	
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
    
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
    
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }
        
	// Drawing 
	
	// primitiveType allows drawing as filled triangles / wireframe / vertices
	
	if( primitiveType == gl.LINE_LOOP ) {
		
		// To simulate wireframe drawing!
		
		// No faces are defined! There are no hidden lines!
		
		// Taking the vertices 3 by 3 and drawing a LINE_LOOP
		
		var i;
		
		for( i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++ ) {
		
			gl.drawArrays( primitiveType, 3 * i, 3 ); 
		}
	}	
	else {
				
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems); 
		
	}	
}

//----------------------------------------------------------------------------


//  Drawing the 3D scene

function drawScene() {

	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing the frame-buffer and the depth-buffer
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix
	
	if( projectionType == 0 ) {
		
		// For now, the default orthogonal view volume
		
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		
		// Global transformation !!
		
		globalTz = 0.0;
		
		// NEW --- The viewer is on the ZZ axis at an indefinite distance
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[3] = 0.0;
		
		pos_Viewer[2] = 1.0;  
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	else {	

		// A standard view volume.
		
		// Viewer is at (0,0,0)
		
		// Ensure that the model is "inside" the view volume
		
		pMatrix = perspective( 45, 1, 0.05, 15 );
		
		// Global transformation !!
		
		globalTz = -2.5;

		// NEW --- The viewer is on (0,0,0)
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
		
		pos_Viewer[3] = 1.0;  
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	

	//  Passing the viewer position to the vertex shader
	
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"),
        flatten(pos_Viewer) );
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE

	// For XX not complete yet
	mvMatrix = mult(translationMatrix( 1, 0, 0), rotationXXMatrix( globalAngleXX ));
	
	// For ZZ
	mvMatrix = mult( translationMatrix( 0, 0, globalTz ),
					  rotationZZMatrix( globalAngleZZ ));
		
	// For YY				  
	mvMatrix = mult(mvMatrix, rotationYYMatrix( globalAngleYY ));
	
	// NEW - Updating the position of the light sources, if required
	
	// FOR EACH LIGHT SOURCE
	    
	for(var i = 0; i < lightSources.length; i++ )
	{
		// Animating the light source, if defined
		    
		var lightSourceMatrix = mat4();

		if( !lightSources[i].isOff() ) {
				
			if( lightSources[i].isRotYYOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationYYMatrix( lightSources[i].getRotAngleYY() ) );
			}

			//ZZ 
			if( lightSources[i].isRotXXOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationXXMatrix( lightSources[i].getRotAngleXX() ) );

			}
			//XX
			if( lightSources[i].isRotZZOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationZZMatrix( lightSources[i].getRotAngleZZ() ) );

			}



		}
		
		//  Passing the Light Source Matrix to apply
	
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
	
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}
			
	// Instantianting all scene models
	
	for(var i = 0; i < sceneModels.length; i++ )
	{ 
		drawModel( sceneModels[i],
			   mvMatrix,
	           primitiveType );
	}
	           
	// NEW - Counting the frames
	
	countFrames();
}

//----------------------------------------------------------------------------
//
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime != 0 ) {
		
		var elapsed = timeNow - lastTime;
		
		// Global rotation

		if( globalRotationXX_ON ) {
			globalAngleXX += globalRotationXX_DIR * globalRotationXX_SPEED * (90 * elapsed) / 1000.0;
		}
		
		if( globalRotationYY_ON ) {

			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
		}
		if( globalRotationZZ_ON ) {
			globalAngleZZ += globalRotationZZ_DIR * globalRotationZZ_SPEED * (90 * elapsed) / 1000.0;
		}
		

		// For every model --- Local rotations not use here
		
		for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[2].rotXXOn ) {

				sceneModels[2].rotAngleXX += sceneModels[2].rotXXDir * sceneModels[2].rotXXSpeed * (90 * elapsed) / 1000.0;
			}

			if( sceneModels[i].rotYYOn ) {

				sceneModels[i].rotAngleYY += sceneModels[i].rotYYDir * sceneModels[i].rotYYSpeed * (90 * elapsed) / 1000.0;
			}

			if( sceneModels[i].rotZZOn ) {

				sceneModels[i].rotAngleZZ += sceneModels[i].rotZZDir * sceneModels[i].rotZZSpeed * (90 * elapsed) / 1000.0;
			}
		}
		// Bouncing animation
			var h = 575;
			var k = 2 - (2*(50/600));
			var a = -4 * k / Math.pow(h * 2, 2);
			
			var start, time;
			(function drawPosition(auxtime) {
				if (!start) { start = auxtime };
				time = auxtime - start;
				ypos = a * Math.pow(((auxtime + h) % (h * 2) - h), 2) + k/2;
				y1pos = a * Math.pow(((timeNow + h) % (h * 2) - h), 2) + k/2;
				sceneModels[1].ty = ypos;
				sceneModels[2].ty = y1pos;
				sceneModels[3].ty = y1pos;
				/*
				sceneModels[4].ty = y1pos;
				sceneModels[5].ty = y1pos;
				*/
				for (var i=4; i<sceneModels.length;i++){
					sceneModels[i].ty = y1pos;
					

			}
			//console.log(auxtime);
			//window.requestAnimationFrame(drawPosition);
			})(performance.now());
			
		
		// I Am the sun 
		// Maybe if the angle was from x to y, 
		// I could put lights rotating from sun to lamp
		// Maybe with time??
		// Will try to find another way later
		if( lightSources[1].isRotYYOn() ) {
			var angle = lightSources[1].getRotAngleYY() + lightSources[1].getRotationSpeed() * (90 * elapsed) / 1000.0;
			lightSources[1].setRotAngleYY( angle );
			//console.log(angle);
		}
		if( lightSources[2].isRotXXOn() ) {
			var angle = lightSources[2].getRotAngleXX() + lightSources[2].getRotationSpeed() * (-90 * elapsed) / 1000.0;
			lightSources[2].setRotAngleXX( angle );


		}
		if( lightSources[3].isRotZZOn() ) {
			var angle = lightSources[3].getRotAngleZZ() + lightSources[3].getRotationSpeed() * (45 * elapsed) / 1000.0;
			lightSources[3].setRotAngleZZ( angle );

		}



}
	
	lastTime = timeNow;
}


//----------------------------------------------------------------------------

// Timer

function tick() {
	
	requestAnimFrame(tick);
	
	handleKeys();

	drawScene();
	
	animate();
}


//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
    
}

//----------------------------------------------------------------------------


// Handling keyboard events

// Adapted from www.learningwebgl.com

var currentlyPressedKeys = {};

var r = 0.5;
var theta = 0;
var dTheta = 2 * Math.PI / 100;


function handleKeys() {
	
	if (currentlyPressedKeys[37]) {
		
		// Left Button
		/*
			// Originx,originy = center of circule
			// radius = rotation radius
			X = originX + cos(angle)*radius;
			Y = originY + sin(angle)*radius;
			center = 0;
		*/
		//console.log(sceneModels[3].tz);
		//console.log(sceneModels[3].tx);
		theta += dTheta;
		sceneModels[2].tx = -r * Math.cos(theta);
		sceneModels[2].tz = -r * Math.sin(theta);
		sceneModels[3].tx = r * Math.cos(theta);
		sceneModels[3].tz = r * Math.sin(theta);

		
	}
	if (currentlyPressedKeys[39]) {

		// Right arrow
		theta += dTheta;
		sceneModels[2].tx = -r * Math.cos(-theta);
		sceneModels[2].tz = -r * Math.sin(-theta);
		sceneModels[3].tx = r * Math.cos(-theta);
		sceneModels[3].tz = r * Math.sin(-theta);	
		
	} 
	if (currentlyPressedKeys[38]) {
		// Zoom in
		// Up arrow
		// For putting room closer
		// reach max zoom in
		//console.log(sceneModels[1].sx);
		if(sceneModels[0].sz>3){
			var auxRoomz = sceneModels[0].sz* 0.9;
			sceneModels[0].sz=auxRoomz;	
			if(sceneModels[1].sx<0.3){
				for(var i=1; i<sceneModels.length;i++){
					var auxRest = sceneModels[i].sx*1.1;
					sceneModels[i].sx = sceneModels[i].sy = sceneModels[i].sz = auxRest;
				}		
			}
			

		}
		

		
	}
	if (currentlyPressedKeys[40]) {
		
		// Page Down
		// reach max zoom out
		//console.log(sceneModels[0].sz);
		if(sceneModels[0].sz<20){
			var auxRoomz = sceneModels[0].sz* 1.1;
			sceneModels[0].sz=auxRoomz;
			if(sceneModels[1].sz>0.2){
				for(var i=1; i<sceneModels.length;i++){
					var auxRest = sceneModels[i].sx*0.9;
					sceneModels[i].sx = sceneModels[i].sy = sceneModels[i].sz = auxRest;
				}
			}
			

		}

		//sx *= 1.1;
		
		//sz = sy = sx;
	}

}
// Adapted from www.learningwebgl.com


var mouseDown = false;

var lastMouseX = null;

var lastMouseY = null;

function handleMouseDown(event) {
	
    mouseDown = true;
  
    lastMouseX = event.clientX;
  
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {

    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {
	  
      return;
    } 
  
    // Rotation angles proportional to cursor displacement
    
    var newX = event.clientX;
  
	var newY = event.clientY;
	//console.log(newX);

    var deltaX = newX - lastMouseX;
    
	sceneModels[0].rotAngleYY += radians( 10 * deltaX  );
	sceneModels[2].rotAngleYY += radians( 10 * deltaX  );
	sceneModels[3].rotAngleYY += radians( 10 * deltaX  );
	

    var deltaY = newY - lastMouseY;
    
	sceneModels[0].rotAngleXX += radians( 10 * deltaY  );
	sceneModels[2].rotAngleXX += radians( 10 * deltaY  );
	sceneModels[3].rotAngleXX += radians( 10 * deltaY  );
    
    lastMouseX = newX
    
    lastMouseY = newY;
  }


function setEventListeners(canvas){

	// Handling the mouse
	
	// From learningwebgl.com

	canvas.onmousedown = handleMouseDown;
    
    document.onmouseup = handleMouseUp;
    
    document.onmousemove = handleMouseMove;
    
    // Handling the keyboard
	
	// From learningwebgl.com

    function handleKeyDown(event) {
		
        currentlyPressedKeys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
		
        currentlyPressedKeys[event.keyCode] = false;
    }

	document.onkeydown = handleKeyDown;
    
	document.onkeyup = handleKeyUp;
	
	    
      

	// Button events
	/*
	document.getElementById("XX-on-off-button").onclick = function(){
		
		// Switching on / off
		
		// For every model
		
		for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[i].rotXXOn ) {

				sceneModels[i].rotXXOn = false;
			}
			else {
				sceneModels[i].rotXXOn = true;
			}	
		}
	};

	document.getElementById("XX-direction-button").onclick = function(){
		
		// Switching the direction
		
		// For every model
		
		for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[i].rotXXDir == 1 ) {

				sceneModels[i].rotXXDir = -1;
			}
			else {
				sceneModels[i].rotXXDir = 1;
			}	
		}
	};      


	document.getElementById("XXglobal-on-off-button").onclick = function(){
		
		// Switching on / off
		
		if( globalRotationXX_ON ) {
			
			globalRotationXX_ON = 0;
		}
		else {
			
			globalRotationXX_ON = 1;
		}  
	};

	document.getElementById("XXglobal-direction-button").onclick = function(){
		
		// Switching the direction
		
		if( globalRotationXX_DIR == 1 ) {
			
			globalRotationXX_DIR = -1;
		}
		else {
			
			globalRotationXX_DIR = 1;
		}  
	};
	*/
	document.getElementById("YYglobal-on-off-button").onclick = function(){
		
		// Switching on / off
		
		if( globalRotationYY_ON ) {
			
			globalRotationYY_ON = 0;
		}
		else {
			
			globalRotationYY_ON = 1;
		}  
	};

	document.getElementById("YYglobal-direction-button").onclick = function(){
		
		// Switching the direction
		
		if( globalRotationYY_DIR == 1 ) {
			
			globalRotationYY_DIR = -1;
		}
		else {
			
			globalRotationYY_DIR = 1;
		}  
	};
	document.getElementById("ZZglobal-on-off-button").onclick = function(){
		
		// Switching on / off
		
		if( globalRotationZZ_ON ) {
			
			globalRotationZZ_ON = 0;
		}
		else {
			
			globalRotationZZ_ON = 1;
		}  
	};

	document.getElementById("ZZglobal-direction-button").onclick = function(){
		
		// Switching the direction
		
		if( globalRotationZZ_DIR == 1 ) {
			
			globalRotationZZ_DIR = -1;
		}
		else {
			
			globalRotationZZ_DIR = 1;
		}  
	};

	document.getElementById("Green-light-off").onclick = function(){
		
		// Switching on / off
		
		if( lightSources[3].isOn == true ) {
			
			lightSources[3].isOn = false;
		}
		else {
			
			lightSources[3].isOn = true;
		}  
	};
	document.getElementById("Red-light-off").onclick = function(){
		
		// Switching on / off
		
		if( lightSources[2].isOn == true ) {
			
			lightSources[2].isOn = false;
		}
		else {
			
			lightSources[2].isOn = true;
		}    
	};
	document.getElementById("Yellow-light-off").onclick = function(){
		
		if( lightSources[1].isOn == true ) {
			
			lightSources[1].isOn = false;
		}
		else {
			
			lightSources[1].isOn = true;
		}  
	};
	



	var aux = 1
	var tempz = -1;
	var tempx1 = 0.5;
	var tempx2 = -0.5;

	document.getElementById("Add-ball-back").onclick = function(){
		
		sceneModels.push(new sphereModel(aux));
		sceneModels.push(new sphereModel(aux));
		if(aux<5){
			aux+=aux;
		}
		
		var size = sceneModels.length;
		sceneModels[size-1].tx = tempx1 + 0.1; 
		sceneModels[size-2].tx = tempx2 - 0.1;

		sceneModels[size-1].ty = sceneModels[size-2].ty = -1;

		sceneModels[size-1].tz = sceneModels[size-2].tz = tempz - 0.5;

		sceneModels[size-1].sx = sceneModels[size-1].sy  = sceneModels[size-1].sz  = 0.15;
		sceneModels[size-2].sx = sceneModels[size-2].sy  = sceneModels[size-2].sz  = 0.15;
		tempz = sceneModels[size-1].tz;
		tempx1 = sceneModels[size-1].tx;
		tempx2 = sceneModels[size-2].tx;
		
	

	};  
	/*
	var auxRandom;
	document.getElementById("Add-Random").onclick = function(){
		
		auxRandom = getRndInteger();
		if(auxRandom = 0){
			sceneModels.push(new sphereModel(aux));
			sceneModels.push(new sphereModel(aux));
			aux+=aux;
		}
		else if(auxRandom =1){
			sceneModels.push(new tetrahedronModel(1));
			sceneModels.push(new tetrahedronModel(1));

		}
		else if(auxRandom =2){
			sceneModels.push(new cubeModel());
			sceneModels.push(new cubeModel());
		}
		else{
			sceneModels.push(new piramidModel());
			sceneModels.push(new piramidModel());

		}
		console.log(auxRandom);
		var size = sceneModels.length;
		sceneModels[size-1].tx = 0.5; 
		sceneModels[size-2].tx = -0.5;

		sceneModels[size-1].ty = sceneModels[size-2].ty = -1;

		sceneModels[size-1].tz = sceneModels[size-2].tz = sceneModels[size-3].tz - 0.5;

		sceneModels[size-1].sx = sceneModels[size-1].sy  = sceneModels[size-1].sz  = 0.15;
		sceneModels[size-2].sx = sceneModels[size-2].sy  = sceneModels[size-2].sz  = 0.15;
		wasRandom=0;
		wasRandom=1;

	}; 
	*/



	document.getElementById("reset-button").onclick = function(){
		
		// The initial values
		for(var i = 0;i < sceneModels.length;i++){
			sceneModels[i].rotAngleXX=0;
			sceneModels[i].rotAngleYY=0;
			sceneModels[i].rotAngleZZ=0;
		}
		for(var i = 0; i < sceneModels.length; i++ )
	    {
			sceneModels[i].rotXXOn = false;
			sceneModels[i].rotYYOn = false;
			sceneModels[i].rotZZOn = false;
		}
		sceneModels[0].sx = 2.5; 
		sceneModels[0].sy = 1.6
		sceneModels[0].sz = 10;
		sceneModels[1].sx = sceneModels[1].sy = sceneModels[1].sz = 0.25;
		for(var i = 2; i < sceneModels.length; i++ )
	    {
			sceneModels[i].sx = 0.15;
			sceneModels[i].sy = 0.15;
			sceneModels[i].sz = 0.15;
		}
					


		globalAngleXX = 0.0;
		globalAngleYY = 0.0;
		globalAngleZZ = 0.0;

		globalRotationXX_ON = 0;
		globalRotationXX_DIR = 1;
		//globalRotationXX_SPEED = 1;

		globalRotationYY_ON = 0;
		globalRotationYY_DIR = 1;
		//globalRotationYY_SPEED = 1;

		globalRotationZZ_ON = 0;
		globalRotationZZ_DIR = 1;
		//globalRotationZZ_SPEED = 1;

		lightSources[1].isOn = false;
		lightSources[2].isOn = false;
		lightSources[3].isOn = true;


	};

}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {
		
		// Create the WebGL context
		
		// Some browsers still need "experimental-webgl"
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// ViewPort new color
		gl.clearColor(0.9,0.9,0.8,1);

		gl.clear(gl.COLOR_BUFFER_BIT);
		// DEFAULT: The viewport occupies the whole canvas 
		
		
		// Drawing the triangles defining the model
		
		primitiveType = gl.TRIANGLES;
		
		
		// Enable FACE CULLING
		
		gl.enable( gl.CULL_FACE );
		
		// DEFAULT: The Front FACE is culled!!
		
		gl.cullFace( gl.FRONT );
		
		// Enable DEPTH-TEST
		
		gl.enable( gl.DEPTH_TEST );
		
        
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------

function runWebGL() {
	
	var canvas = document.getElementById("my-canvas");
	
	initWebGL( canvas );
	
	shaderProgram = initShaders( gl );
	//console.log(lightSources[0].getPosition()); 

	setEventListeners(canvas);
	
	tick();		// A timer controls the rendering / animation    

	outputInfos();
}

function getRndInteger() {
	return Math.floor(Math.random() * (3 - 0 + 1) ) + 0;
  }


