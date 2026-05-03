audioStart = new Audio('./audio/gameStart.mp3')
audioGameOver = new Audio('./audio/gamrOver.mp3')

//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardHeight/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipe moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //use for drawing on the board

    //draw flappy bird
    //context.fillStyle = "green";
    //context.fillRect(bird.x,bird.y,bird.width,bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./Images/flappybird.png";
    birdImg.onload = function(){
    context.drawImage(birdImg, bird.x,bird.y,bird.width,bird.height);
     }

     topPipeImg = new Image();
     topPipeImg.src= "./Images/toppipe.png";

     bottomPipeImg = new Image();
     bottomPipeImg.src = "./Images/bottompipe.png";
    
     requestAnimationFrame(update);
     setInterval(placePipe, 1500);
     document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        audioStart.play();
        return;
    }
    context.clearRect(0, 0, board.width,board.height);

    //bird
    velocityY += gravity;
    //bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY , 0);
    context.drawImage(birdImg,bird.x,bird.y,bird.width,bird.height);

    if(bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++ ) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width,pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width){
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth ) {
        pipeArray.shift();
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER!!", 5, 90);
        audioGameOver.play();
    }
}

function placePipe() {
    if(gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let toppipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(toppipe);

    let bottompipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(bottompipe);
}

function moveBird(e){
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"){
        //jump
        velocityY = -6;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false; 
        }

    }

}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
    }

    function stopAudioStart(){
        audioStart.pause();
      } 
        stopAudioStart();
    audioGameOver.play();
    
    function stopAudio(){
        audioGameOver.pause();
        }
        setTimeout(stopAudio, 8000);

    clearInterval(loop);


