//Declare variables
var WrestlerInput = pc.createScript('wrestlerInput');
var DirectionObject;

// initialize code called once per entity
WrestlerInput.prototype.initialize = function() {
    //Initialize dynamic variables
    DirectionObject = this.app.root.findByName("South").getPosition(); //Find our dummy "Compass" object called "South". Allows for correct calculations no matter how the artist rotates the stage.
    this.direction = "South"; //Declare the direction string property and initialize it to "South" to keep track of the direction we are facing
    this.rotationSpeed = 8; //Variable that controls the speed of our spherical interpolation later. 8 was tested to be the preferred speed.
};

// update code called every frame
WrestlerInput.prototype.update = function(dt) {
    //Declare quaternion rotation calculation variables
    var original_rotation = new pc.Quat(); //Stores the current rotation of the entity
    var final_rotation = new pc.Quat(); //Stores the desired rotation of the entity
    
    original_rotation.copy(this.entity.getRotation()); //Copy the current rotation of the player into the original_rotation variable
    this.entity.lookAt(DirectionObject); //This function gets the precise angle needed to look at the DirectionObject and sets the entity's rotation to it
    final_rotation.copy(this.entity.getRotation()); //Copy the desired rotation into the final_rotation variable
    this.entity.setRotation(original_rotation); //Set the player's rotation back to the original, as we will be spherical linear interpolating between the values for a smooth rotation
    
    var new_rotation = this.rotateTowards(original_rotation, final_rotation, this.rotationSpeed*dt); //Insert the 2 rotations into the rotateTowards function to begin the spherical interpolation.
    //The third input is our speed, which we defined as 8 earlier. It's multiplied by delta time so that the speed will always be the same independently of the framerate of the user.
    
    this.entity.setRotation(new_rotation); //Calculations are done, rotate our player by the amount calculated.
    
    DirectionObject = this.app.root.findByName(this.direction).getPosition(); //Convert our string this.direction to the in-game compass/direction object we want to face
    
    if (this.app.keyboard.isPressed(pc.KEY_W)) { //If the player presses W, the character needs to face North. This string is converted to an in-game object during the next frame.
        this.direction = "North";
    }

    if (this.app.keyboard.isPressed(pc.KEY_S)) { //And so on for the other keys
        this.direction = "South";
    }
    
    if (this.app.keyboard.isPressed(pc.KEY_A)) {
        this.direction = "West";
    }

    if (this.app.keyboard.isPressed(pc.KEY_D)) {
        this.direction = "East";
    }
    
};

// Get the dot product between two quaternions
WrestlerInput.prototype.dot = function (quat_left, quat_right) {
    var dot = quat_left.x * quat_right.x + quat_left.y * quat_right.y + 
        quat_left.z * quat_right.z + quat_left.w * quat_right.w;

    return dot;
};

// Returns the angle in degrees between two rotations /a/ and /b/.
WrestlerInput.prototype.quatAngle = function (quat_a, quat_b) {
    var dot = this.dot(quat_a, quat_b);
    
    if(quat_a.equals(quat_b) )
    {
        return 0;
    }        
    
    var rad2Deg = 1 / (Math.PI / 180);

    var angle = Math.acos(Math.min(Math.abs(dot), 1)) * 2 * rad2Deg;

    return angle;
    
};

WrestlerInput.prototype.rotateTowards = function (quat_a, quat_b, percent) {
    var angle = this.quatAngle(quat_a, quat_b);
        
    if (angle === 0) //Check against our base case
    {
        return quat_b;
    }
    
    return new pc.Quat().slerp(quat_a, quat_b, percent); //Return the interpolated result
    
};