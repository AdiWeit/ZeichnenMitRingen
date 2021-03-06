const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE"; // color of an empty square
if (!localStorage.getItem("storedName")) var name = prompt("Wie wollen sie sich nennen? (Eingabe bitte merken! Die Eingabe wird für die Speicherung der Highscores benötigt.");
else var name = localStorage.getItem("storedName");
localStorage.setItem("storedName", name);
nameEingeloggt.innerHTML = "als " + name + " eingeloggt";
var highscores = [];
dbGet("tetrisBoards", "highscores").then(result => {
  highscores = result;
}).catch(function(e) {
  console.log("no db data there (offline also possible)");
});
var app = new Vue({
el: '#app',
data: {
db: []
}
})
// draw a square
function drawSquare(x,y,color, board){
  console.log("next scrare");
  try {
    ctx[board].fillStyle = color;
    ctx[board].fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx[board].strokeStyle = "BLACK";
    ctx[board].strokeRect(x*SQ,y*SQ,SQ,SQ);
  } catch (e) {
    console.log("abc");
  }
  }
var board = [[], []];
var shop = [];
var ctx = [];
const scoreElement = document.getElementById("score");
// create the board
function beginnRound() {
  gameOver = false;
  board = [[], []];
  shop = [];
  ctx = [];
  settings.style.display = "none";
for (var i = 0; i < board.length; i++) {
for( r = 0; r <ROW; r++){
    board[i][r] = [];
    for(c = 0; c < COL; c++){
        board[i][r][c] = VACANT;
    }
  }
}
for (var i = 0; i < 20; i++) {
  shop[i] = [];
  for (var i1 = 0; i1 < 3; i1++) {
    shop[i][i1] = VACANT;
  }
}
for (var i = 0; i < board.length; i++) {
  ctx[i] = document.getElementById("tetris " + i).getContext("2d");
}
ctx[i] = document.getElementById("shop").getContext("2d");
drawBoard();
for (var i = 0; i < PIECES.length; i++) {
  shopTiles.forcedTiles[i].draw();
}
for (var i = 0; i < addTiles.length; i++) {
  shopTiles.fillTiles[i].draw();
}
CONTROL({key:"p"});
}

// draw the board
function drawBoard(){
  console.log("draw board");
  for (var i = 0; i < board.length; i++) {
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[i][r][c], i);
        }
    }
  }
}

// the pieces and their colors

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];
const addTiles = [
  [one, "red"],
  [two, "green"],
  [edge, "blue"]
]
var shopTiles = {forcedTiles: [], fillTiles: []};
for (var i = 0; i < PIECES.length; i++) {
  shopTiles.forcedTiles.push(new Piece( PIECES[i][0],PIECES[i][1], board.length, i*5, 0));
}
for (var i = 0; i < addTiles.length; i++) {
  shopTiles.fillTiles.push(new Piece( addTiles[i][0],addTiles[i][1], board.length, i*5, 4));
}
// generate random pieces

function randomPiece(board){
  // for (var i = 0; i < board.length; i++) {
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    if (nextStone && nextStone[board] != undefined) {
      r = nextStone[board];
      nextStone[board] = undefined;
    }
    return new Piece( PIECES[r][0],PIECES[r][1], board);
  // }
}

let p = [];
for (var i = 0; i < board.length; i++) {
  p[i] = randomPiece(i);
}

// The Object Piece

function Piece(tetromino,color, board, x, y){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // we start from the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // we need to control the pieces
    this.x = 3;
    if (x != undefined) this.x = x;
    this.y = -2;
    if (y != undefined) this.y = y;
    this.board = board;
    this.locked = false;
    this.waitingForNewPiece = false;
}

// fill function

Piece.prototype.fill = function(color){
  console.log("fill");
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we draw only occupied squares
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color, this.board);
            }
        }
    }
}

// draw a piece to the board

Piece.prototype.draw = function(){
  console.log("draw");
    this.fill(this.color);
}

// undraw a piece


Piece.prototype.unDraw = function(){
  console.log("unDraw");
    this.fill(VACANT);
}

// move Down the piece

Piece.prototype.moveDown = function(){
  console.log("moveDown");
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else if (!this.locked){
        // we lock the piece and generate a new one
        this.lock();
        console.log("new for " + this.board);
        var waiting = 0;
        for (var i = 0; i < board.length; i++) {
          if (p[p.length - 1 - i].waitingForNewPiece) waiting++;
        }
        if (waiting == board.length) {
          for (var i = 0; i < board.length; i++) {
            p.push(randomPiece(i));
            addedI++;
          }
          // update the board
          drawBoard();
        }
    }

}

// move Right the piece
Piece.prototype.moveRight = function(){
  console.log("moveRight");
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// move Left the piece
Piece.prototype.moveLeft = function(){
  console.log("moveLeft");
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// rotate the piece
Piece.prototype.rotate = function(/*checkCollision*/){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;

    if(this.collision(0,0,nextPattern)/* && checkCollision*/){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }

    if(!this.collision(kick,0,nextPattern)/* || !checkCollision*/){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;
var points = 0;
var dbSetWarteschlange = [];
setInterval(function () {
  if (dbSetWarteschlange.length > 0) {
    dbSet("tetrisBoards", dbSetWarteschlange[0].tag, dbSetWarteschlange[0].data);
    dbSetWarteschlange.shift();
  }
}, 2222);
Piece.prototype.lock = function(){
  console.log("lock");
  this.locked = true;
  this.waitingForNewPiece = true;
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Spiel vorbei!");
                // stop request animation frame
                gameOver = true;
                pause = true;
                if (!highscores[JSON.parse(pointsPerRow.value)]) highscores[(pointsPerRow.value)] = {};
                if (!highscores[JSON.parse(pointsPerRow.value)][name] || score > highscores[JSON.parse(pointsPerRow.value)][name]) {
                  highscores[(pointsPerRow.value)][name] = score;
                  if (score > highscores[JSON.parse(pointsPerRow.value)][name]) alert("Glückwunsch! Sie haben einen neuen Beststand erreicht!");
                }
                settings.style.display = "inline";
                dbSetWarteschlange.push({tag: "highscores", data: highscores});
                while (app.db.length > 0) {
                  app.db.pop();
                }
                for (name of Object.keys(highscores[JSON.parse(pointsPerRow.value)])) {
                  app.db.push(name + ": " + highscores[JSON.parse(pointsPerRow.value)][name]);
                }
                break;
            }
            // we lock the piece
            board[this.board][this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[this.board][r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[this.board][y][c] = board[this.board][y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                board[this.board][0][c] = VACANT;
            }
            // increment the score
            score += 10;
            points += 2;
        }
    }

    // update the score
    scoreElement.innerHTML = score;
    document.getElementById("points").innerHTML = points;
}

// collision fucntion

Piece.prototype.collision = function(x,y,piece){
  console.log("collision");
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // if the square is empty, we skip it
            if(!piece[r][c]){
                continue;
            }
            // coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // skip newY < 0; board[-1] will crush our game
            if(newY < 0){
                continue;
            }
            // check if there is a locked piece alrady in place
            try {
              if( board[this.board][newY][newX] != VACANT){
                return true;
              }
            } catch (e) {
              console.log("debug");
            }
        }
    }
    return false;
}

// CONTROL the piece

document.addEventListener("keydown",CONTROL);
var pause = true;
function CONTROL(event){
  viewImage();
  for (var i = 0; i < board.length; i++) {
    if(event.keyCode == 37 && !pause){
        p[p.length - 1 - i].moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
      if (!fillStone) {
        p[p.length - 1 - i].rotate(/*true*/);
        dropStart = Date.now();
      }
      else if (i == board.length - 1) {
        fillStone.rotate();
        dropStart = Date.now();
      }
    }else if(event.keyCode == 39 && !pause){
        p[p.length - 1 - i].moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40 && !pause){
        p[p.length - 1 - i].moveDown();
    }
  }
  if (event.key == "p" && !gameOver) pause = !pause
  if (!pause && !gameOver) drop();
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
var addedI = 0;
function drop(){
  // console.log("drop");
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
      for (var i = 0; i < board.length; i++) {
        // var activeP = [];
        // for (var pNow of p) {
        //   if (pNow.y >= 0 || p.length == board.length) activeP.push(pNow);
        // }
        p[/*activeP*/p.length - i - 1 - addedI].moveDown();
      }
      addedI = 0;
        dropStart = Date.now();
    }
    if( !gameOver && !pause){
        requestAnimationFrame(drop);
    }
}

drop();
var startCoord = {x: -1, y: -1};
// var move = "";
document.addEventListener('touchstart', touch);
document.addEventListener('touchmove', touch);
document.addEventListener('touchend', touch);
function touch(ev) {
// mausx = ev.touches[0]["pageX"];
// mausy = ev.touches[0]["pageY"];
// if (ev.type == "touchstart" ) {
//   move = "";
// }
if (ev.type == "touchmove") {
  readMouseMove({clientX: ev.touches[0]["pageX"], clientY: ev.touches[0]["pageY"]});
  if (!fillStone) {
    var newCoord = {x: JSON.parse((ev.touches[0]["pageX"]/SQ + "").split(".")[0]), y: JSON.parse((ev.touches[0]["pageY"]/SQ + "").split(".")[0])};
    if (newCoord.x > startCoord.x && ((newCoord.y > startCoord.y && newCoord.y - startCoord.y < newCoord.x - startCoord.x) || newCoord.y <= startCoord.y)) CONTROL({keyCode: 39});
    else if (newCoord.x < startCoord.x && ((newCoord.y > startCoord.y && newCoord.y - startCoord.y < startCoord.x - newCoord.x) || newCoord.y <= startCoord.y)) CONTROL({keyCode: 37});
    else if (newCoord.y > startCoord.y/*newCoord.y - startCoord.y > 2 || newCoord.y - startCoord.y < -2*/) {
      CONTROL({keyCode: 40});
    }
    startCoord = newCoord;
  }
}
if (ev.type == "touchend" && fillStone) {
  CONTROL({keyCode: 38});
}
}
document.onmousemove = readMouseMove
function viewPage () {
  var el = document.body;
  toggleFullscreen(el);
};

function viewImage () {
  var el = body/*document.getElementById('myImage');*/
  toggleFullscreen(el);
};

function toggleFullscreen (el) {
/*		if(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement){
    if(document.exitFullscreen){
    //	document.exitFullscreen();
    }else if(document.mozCancelFullScreen){
  //		document.mozCancelFullScreen();
    }else if(document.webkitExitFullscreen){
  //		document.webkitExitFullscreen();
    }else if(document.msExitFullscreen){
  //		document.msExitFullscreen();
    }
  }else{*/
    if(document.documentElement.requestFullscreen){
      el.requestFullscreen();
    }else if(document.documentElement.mozRequestFullScreen){
      el.mozRequestFullScreen();
    }else if(document.documentElement.webkitRequestFullscreen){
      el.webkitRequestFullscreen();
    }else if(document.documentElement.msRequestFullscreen){
      el.msRequestFullscreen();
    }
//	}
};
var xMaus;
var yMaus;
var storedPosition = {};
function readMouseMove(e) {
  xMaus = e.clientX //- 10;
  yMaus = e.clientY //+ 23//- 33;
  if (fillStone) {
    var boardX = xMaus - document.getElementById("tetris " + fillStone.board).getBoundingClientRect().x// - scrollX;
    var boardY = yMaus - document.getElementById("tetris " + fillStone.board).getBoundingClientRect().y //- scrollY;
    if (collisionFilling(fillStone.x, fillStone.y) && !collisionFilling(JSON.parse((boardX/SQ + "").split(".")[0]), JSON.parse((boardY/SQ + "").split(".")[0]))) {
      fillStone.x = storedPosition.x;
      fillStone.y = storedPosition.y;
    }
    if (!collisionFilling(fillStone.x, fillStone.y) && !collisionFilling(JSON.parse((boardX/SQ + "").split(".")[0]), JSON.parse((boardY/SQ + "").split(".")[0]))) fillStone.unDraw();
    if (collisionFilling(JSON.parse((boardX/SQ + "").split(".")[0]), JSON.parse((boardY/SQ + "").split(".")[0])) && !collisionFilling(fillStone.x, fillStone.y)) {
      storedPosition = {x: fillStone.x, y: fillStone.y};
    }
    fillStone.x = JSON.parse((boardX/SQ + "").split(".")[0]);
    fillStone.y = JSON.parse((boardY/SQ + "").split(".")[0]);
    if (!collisionFilling(fillStone.x, fillStone.y)) {
    fillStone.draw();
  }
  }
}
function collisionFilling(x, y) {
  var fallingFields = {x: [], y: []};
  for (var i = 0; i < p[p.length - 2 + fillStone.board].activeTetromino.length; i++) {
    for (var i1 = 0; i1 < p[p.length - 2 + fillStone.board].activeTetromino[i].length; i1++) {
      if (p[p.length - 2 + fillStone.board].activeTetromino[i][i1] == 1) {
        fallingFields.y.push(p[p.length - 2 + fillStone.board].y + i);
        fallingFields.x.push(p[p.length - 2 + fillStone.board].x + i1);
      }
    }
  }
  for (var i = 0; i < fillStone.activeTetromino.length; i++) {
    for (var i1 = 0; i1 < fillStone.activeTetromino[i].length; i1++) {
        if (fillStone.activeTetromino[i][i1] == 1 && x >= 0 && y >= 0 && y < board[fillStone.board].length && x < board[fillStone.board][y].length && (board[fillStone.board][y + i][x + i1] != VACANT)) {
          return true;
        }
        for (var i2 = 0; i2 < fallingFields.x.length; i2++) {
          if (fallingFields.x[i2] == x + i1 && fallingFields.y[i2] == y + i && fillStone.activeTetromino[i][i1] == 1) return true;
        }
    }
  }
  if (!(x >= 0 && y >= 0 && y < board[fillStone.board].length && x < board[fillStone.board][y].length)) {
    return true;
  }
  return false;
}
function bodyClicked() {
  if (fillStone && !collisionFilling(fillStone.x, fillStone.y) && confirm('Wollen sie hier wirklich den Stein festsetzen? Wenn ja, drücken sie danach "p", um das Spiel fortzuführen!')) {
    // CONTROL({key:"p"});
    // pause = false;
    fillStone.lock();
    drawBoard();
    for (var i = 0; i < board.length; i++) {
      p[p.length - 1 - i].draw();
    }
    fillStone = undefined;
  }
  else if (!fillStone && (xMaus < document.getElementById("shop").getBoundingClientRect().x || xMaus > document.getElementById("shop").getBoundingClientRect().x) && (yMaus < document.getElementById("shop").getBoundingClientRect().y || yMaus > document.getElementById("shop").getBoundingClientRect().y)) {
    pause = true;
    CONTROL({keyCode: 38});
    pause = false;
  }
}
var fillStone;
var requiredPoints = {forcedTiles: [3, 3, 4, 4, 3, 5, 3], fillTiles: [8, 7, 4]};
var nextStone = [];
function shopClicked() {
  var x = xMaus - document.getElementById("shop").getBoundingClientRect().x;
  var y = yMaus - document.getElementById("shop").getBoundingClientRect().y;
  for (var i = 0; i < PIECES.length; i++) {
    if (x > SQ*i*5 && x < SQ*(i + 1)*5 && y > 0 && y < SQ*3){
      fillStone = "in prep";
      if (points >= requiredPoints.forcedTiles[i]) {
      var board = prompt('Für das wievielte Spielbrett wollen sie den nächsten Stein (als ' + PIECES[i][1] + ') festlegen? Sie verlieren dabei ' + requiredPoints.forcedTiles[i] + ' Punkte! Wenn sie sich verklickt haben, klicken sie bitte auf "abbrechen"');
      if (board && board > 0 && board < ctx.length/* && !isNaN(board)*/) {
          points -= requiredPoints.forcedTiles[i];
          document.getElementById("points").innerHTML = points;
          nextStone[board - 1] = i;
        }
      }
      else alert("Sie haben zu wenig Punkte, um diesen Stein reservieren zu können!");
    }
    if (x > SQ*i*5 && x < SQ*(i + 1)*5 && y > SQ*4 && y < SQ*6){
      fillStone = "in prep";
      if (points >= requiredPoints.fillTiles[i]) {
      var board = prompt('In das wievielte Spielbrett wollen sie den Stein einsetzen?');
      if (ctx[board - 1] && board < ctx.length && confirm("Sind sie sich sicher, dass sie " + requiredPoints.fillTiles[i] + " Punkte für den ausgewählten Stein (" + addTiles[i][1] + ") zum Einsetzen bezahlen wollen?")) {
        pause = true;
        points -= requiredPoints.fillTiles[i];
        document.getElementById("points").innerHTML = points;
        fillStone = new Piece( addTiles[i][0], addTiles[i][1], board - 1, -4, -4)
    }
    }
    else alert("Sie brauchen " + requiredPoints.fillTiles[i] + " Punkte, um sich diesen Stein zum Einsetzen leisten zu können!");
  }
  }
  if (fillStone == "in prep") {
    setTimeout(function () {
      fillStone = undefined;
    }, 10);
  }
}
