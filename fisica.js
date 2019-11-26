
//physics for 2 balls

function jump(elapsed){

	// Decrease velocity at gravity rate
	vY += gravity * (90 * elapsed) / 1000.0;

	// Change height
	ty += vY * (90 * elapsed) / 1000.0;

	// Rotate in the xx axis 90º on jump
	angleXX -= angleRate * (90 * elapsed) / 1000.0;
}

function SpeedupButton(){
	for(var j=0; j<speedup.length; j++){

		// Delete the speedups that have pass the ball
		if(tz<speedup[j][2]-(sz+2.5)){
			speedup.splice(j, 1);
			j-=1;
			continue;
		}

		// Else, there is a collision in the ZZ axis!
		// Check if there is a collision on the XX and YY axis.
		if(tz>speedup[j][2]-0.5 && tz<speedup[j][2]+0.5){
			if(tx>speedup[j][0]-0.65 && tx<speedup[j][0]+0.65){
				return true;
			}
		}
	}

	return false;
}

function SlowDownButton(){
	for(var j=0; j<slowdown.length; j++){

		// Delete the speedups that have pass the ball
		if(tz<slowdown[j][2]-(sz+2.5)){
			slowdown.splice(j, 1);
			j-=1;
			continue;
		}

		// Else, there is a collision in the ZZ axis!
		// Check if there is a collision on the XX and YY axis.
		if(tz>slowdown[j][2]-0.5 && tz<slowdown[j][2]+0.5){
			if(tx>slowdown[j][0]-0.65 && tx<slowdown[j][0]+0.65){
				return true;
			}
		}
	}

	return false;
}

function advanceBall(elapsed){

	// The rate at which the ball will jump
	var rate;

	if(SpeedupButton()){
		rate = elapsed*game_velocity*2;
	}
	if(SlowDownButton())
	else{
		rate = elapsed*game_velocity;
	}

	tz -= rate;
	globalTZZ += rate;

}

