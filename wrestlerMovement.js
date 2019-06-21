// This script is responsible for taking keyboard input and using it to apply kinetic force to the player object to make the player move smoothly
// It also handles animation based on how fast the player is moving by reading the force variable
// 
// Declare variables
var WrestlerMovement = pc.createScript('wrestlerMovement');
var Stage;
var myModel;

// initialize function called once per entity
WrestlerMovement.prototype.initialize = function() {
    //Declare force properties
    this.force = new pc.Vec3(); // Our running total force that we are adding to and applying every frame
    this.subforce = new pc.Vec3(); // The force desired to be added to the running total based on the keyboard input
    this.finalForce = new pc.Vec3(); // The temporary property used for calculations before replacing the force variable
    
    this.forceMultiplier = 23;
    
    Stage = this.app.root.findByName("DirectionsRoot"); // We use the Stage object to calculate directions so that no matter how the artist orients the level, the calculations are correct
    myModel = this.app.root.findByName("wrestler_anim"); // Find the model object so that we can change the animation based on the speed of the player
    
    this.animState = "wrestler_idle.json"; // Animation changes must only be called once, so if animState does not match lastAnimState
    this.lastAnimState = "wrestler_idle.json"; // only then is the play animation function called. Otherwise the animation resets to frame 1 indefinitely.
};

// update function called every frame
WrestlerMovement.prototype.update = function(dt) {
    
    // Declare some short-hand aliases for added legibility.
    var force = this.force;
    var finalForce = this.finalForce;
    var app = this.app;
    var forceMultiplier = this.forceMultiplier;


    // Get the stage transform directions to determine movement directions
    var forward = Stage.forward;
    var right = Stage.right;
       

    // Movement axis variables
    var x = 0;
    var z = 0;

    // Use W-A-S-D keys to move player
    // Check for key presses
    if (app.keyboard.isPressed(pc.KEY_A)) { // Move left when the user presses A. Note that we must always calculate both axes to account for any rotations the artist has done.
        x -= right.x;
        z -= right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_W)) {
        x += forward.x;
        z += forward.z;
    }

    if (app.keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }

    // Use the direction from keypresses to apply force to the character
    if (x !== 0 || z !== 0) {
        force.set(x, 0, z).normalize().scale(forceMultiplier); // Normalize the force and make it a reasonable amount
        finalForce.set(force.x - this.entity.rigidbody.linearVelocity.x, 0, force.z - this.entity.rigidbody.linearVelocity.z); // Calculate the force in each axis
        this.entity.rigidbody.applyForce(finalForce); // Apply the force calculated
    }
    
    if(this.animState != this.lastAnimState) // If our current animation state doesn't match the desired animation state, switch animations
        {
            myModel.animation.play(this.animState, 0.2); // The magic number here is the animation blend speed
            this.lastAnimState = this.animState;
        }
    
    if (Math.abs(this.entity.rigidbody.linearVelocity.x) > 0.4 ||  // Check if the player's velocity is greater than 0.4 in any given axis.
        Math.abs(this.entity.rigidbody.linearVelocity.z) > 0.4) // If so, the desired animation state is walking. Otherwise it is the idle animation.
    {
        this.animState = "wrestler_walk.json";
    }
    else
        {
            this.animState = "wrestler_idle.json";
        }
    
};
