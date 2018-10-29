//= require jquery

var cvs = $("#canvas")[0];
var ctx = cvs.getContext("2d");

//load images

var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeTop = new Image();
var pipeBottom = new Image();

bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";
pipeTop.src = "images/pipeTop.png";
pipeBottom.src = "images/pipeBottom.png";

//variables
var bX = 10;
var bY = 150;
var bVelY = 0;
var keysDown = [];
var gap = 85;
var constant;
var gravity = 0.4; // original was 1.8
var score = 0;

//audio
var fly = new Audio();
var points = new Audio();

fly.src = "sounds/fly.mp3";
points.src = "sounds/point.mp3";

$(window).on("load", function(){
    $("canvas").hide();
    $("button").click(start);
    $("#point").text("Last score: " + localStorage["pastScore"]);
});

function start(){
    $("canvas").show();
    constant = pipeTop.height + gap;

    //pipe
    var pipe = [];

    pipe[0] = {
        x: cvs.width,
        y: 0 
    }

    function clamp(val, min, max) {
        if (val < min) { return min; } else
        if (val > max) { return max; } else {
            return val;
        }
    }

    function hasCollided(rect1, rect2) {
        if (rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y) {
            return true;
         }
         
         return false;
    }

    function update() {

        bVelY += gravity; // apply gravity to the velocity

        if (keysDown[32] || // 'space' key
            keysDown[87] || // 'W' key
            keysDown[38]) { // up arrow
            bVelY -= 1.3;
            fly.play();
        }

        bY += bVelY; // add the bird's velocity to the bird's position

        bY = clamp(bY, 0, cvs.height);

        if (bY == 0) { // Zero out the velocity if bird reaches top of screen (so the bird doesn't stick for a few seconds)
            bVelY = 0;
        }

        if (bY + bird.height >=  cvs.height - fg.height) {
            bX = 10;
            bY = 150;
            bVelY = 0;
            localStorage["pastScore"] = score;
            location.reload();
        }

        for (var i = 0; i < pipe.length; i++) {
            pipe[i].x--;

            if(pipe[i].x == 125){
                pipe.push({
                    x: cvs.width,
                    y: Math.floor(Math.random() * pipeTop.height) - pipeTop.height
                });
            }

            //detect collision
            if (hasCollided({
                x: bX,
                y: bY,
                width: bird.width,
                height: bird.height
            }, {
                x: pipe[i].x + 1,
                y: pipe[i].y,
                width: pipeTop.width - 1,
                height: pipe[i].y + constant + 5
            })) {
                localStorage["pastScore"] = score;
                location.reload();
            }

            if(bX + bird.width >= pipe[i].x + 1 && bX <= pipe[i].x + pipeTop.width - 1 
                && (bY <= pipe[i].y + pipeTop.height - 5 || bY+bird.height >= pipe[i].y+constant + 5) 
                || bY + bird.height >=  cvs.height - fg.height){

            }

            if(pipe[i].x == 5){
                score++;
                points.play();
            }
        }
    }

    function draw(){
        ctx.drawImage(bg, 0, 0);

        ctx.drawImage(fg, 0, cvs.height - fg.height);

        ctx.drawImage(bird, bX, bY);

        for(var i = 0; i < pipe.length; i++){
            ctx.drawImage(pipeTop, pipe[i].x, pipe[i].y);
            ctx.drawImage(pipeBottom, pipe[i].x, pipe[i].y + constant);
        }

        ctx.fillStyle = "#000000";
        ctx.font = "20px Verdana";
        ctx.fillText("Score: " + score, 10, cvs.height - 20);
    }

    function mainloop() {
        update();
        draw();
        requestAnimationFrame(mainloop);
    }

    mainloop();
}

// Listen for key events
// If a key is down, set the array value of the index of the keycode pressed to 'true'
window.addEventListener("keydown", function(e) {
    var keyCode = (e.keyCode ? e.keyCode : e.which);
    keysDown[keyCode] = true;
});

// If a key is up, set the array value of the index of the keycode pressed to 'false'
window.addEventListener("keyup", function(e) {
    var keyCode = (e.keyCode ? e.keyCode : e.which);
    keysDown[keyCode] = false;
});