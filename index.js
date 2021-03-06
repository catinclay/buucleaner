var theCanvas = document.getElementById("mainCanvas");
var gameOverLabel = document.getElementById("gameOverLabel");
var scoreLabel = document.getElementById("scoreLabel");
var restartButton = document.getElementById("restartButton");
var context = theCanvas.getContext("2d");
var gridWidth = 8;
var gridHeight = 6;
var shapes = [];
var countBoard = [];
var dropBoard = [];
var explodingShapes = [];
var grabIndexI;
var grabIndexJ;
var destinationIndexI;
var timer;
var easeAmount = 0.55;
var explodeEase = 0.9;
var isDragging = false;
var scoreCount = 4;
var movingShapes = [];
var hasMousedoneHandler;
var countDown = 3000;
var clockOrigin = -350;
var clock = clockOrigin;
var health = 100;
var damage = 15;
var isDamaged = false;
var score = 0;
var speedUpRatio = 0.98;

function init(){
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
	theCanvas.addEventListener('touchstart', touchDownListener, false);
	hasMousedoneHandler = true;
	explodingShapes = [];
	makeShapes();
	drawShapes();
	timer = setInterval(onTimerTick, 1000/30);
	damage = 15;
	health = 100;
	score = 0;
	speedUpRatio = 0.90;
	countDown = 3000;
	clock = clockOrigin;
	scoreLabel.innerHTML = score;
	theCanvas.style.display = "block";
	restartButton.style.display = "none";
	gameOverLabel.style.display = "none";
}

function makeShapes() {
	shapes = [];
	countBoard = [];
	dropBoard = [];
	var i;
	var j;
	for (i = 0; i < gridWidth; ++i) {
		var subShapes = [];
		var subCountBoard = [];
		var subDropBoard = [];
		for(j = 0; j < gridHeight; ++j) {
			var tempType = Math.floor(Math.random()*5);
			tempShape = new SimpleSquareParticle(i, j, tempType);
			subShapes.push(tempShape);
			movingShapes.push(tempShape);
			subCountBoard.push(0);
			subDropBoard.push(0);
		}
		shapes.push(subShapes);
		countBoard.push(subCountBoard);
		dropBoard.push(subDropBoard);
	}
}

function drawShapes() {
	var i;
	var j;
	for (i=0; i < shapes.length; ++i) {
		for(j = 0; j < shapes[i].length; ++j){
			shapes[i][j].drawToContext(context);
		}
	}
	for(i = 0; i < explodingShapes.length; ++i){
		explodingShapes[i].drawToContext(context);
	}
}
function drawScreen() {
	//bg
	if(isDamaged){
		context.fillStyle = "rgba(255,0,0,0.5)";
		isDamaged = false;
	}else{
		context.fillStyle = "#FFFFFF";
	}
	context.fillRect(0,0,theCanvas.width,theCanvas.height);
	context.fillStyle = "#FF0000";
	context.fillRect(0,theCanvas.height*0.75,theCanvas.width*health/100,theCanvas.height*0.06);
	context.fillStyle = "#0000FF";
	context.fillRect(0,theCanvas.height*0.85,theCanvas.width*clock/countDown, theCanvas.height*0.06);

	drawShapes();		
}

function mouseDownListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	// console.log(mouseX);
	// console.log(mouseY);	
	var i;
	var j;
	for (i=0; i < shapes.length; ++i) {
		for(j = 0; j < shapes[i].length; ++j){
			if (shapes[i][j].hitTest(mouseX, mouseY)) {	
				grabIndexI = i;
				grabIndexJ = j;
			}
		}
	}
	// console.log(grabIndexI+", "+grabIndexJ);
	
	window.addEventListener('mousemove', mouseMoveListener, false);
	window.addEventListener('touchmove', touchMoveListener, false);
	window.addEventListener('mouseup', mouseUpListener, false);
	window.addEventListener('touchend', touchUpListener, false);
	theCanvas.removeEventListener('mousedown', mouseDownListener, false);
	theCanvas.removeEventListener('touchstart', touchDownListener, false);

	hasMousedoneHandler = false;
}

function touchDownListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	mouseX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	// console.log(mouseX);
	// console.log(mouseY);	
	var i;
	var j;
	for (i=0; i < shapes.length; ++i) {
		for(j = 0; j < shapes[i].length; ++j){
			if (shapes[i][j].hitTest(mouseX, mouseY)) {	
				grabIndexI = i;
				grabIndexJ = j;
			}
		}
	}
	// console.log(grabIndexI+", "+grabIndexJ);
	
	window.addEventListener('mousemove', mouseMoveListener, false);
	window.addEventListener('touchmove', touchMoveListener, false);
	window.addEventListener('mouseup', mouseUpListener, false);
	window.addEventListener('touchend', touchUpListener, false);
	theCanvas.removeEventListener('mousedown', mouseDownListener, false);
	theCanvas.removeEventListener('touchstart', touchDownListener, false);

	hasMousedoneHandler = false;
}

function mouseMoveListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	var i;
	var j;
	for (i=0; i < shapes.length; ++i) {
		for(j = 0; j < shapes[i].length; ++j){
			if (shapes[i][j].hitTest(mouseX, mouseY)) {	
				if((grabIndexI!=i || grabIndexJ!=j) && 
					(Math.abs(grabIndexI-i)==1) || 
					(Math.abs(grabIndexJ-j)==1)){
					destinationIndexI = i;
					destinationIndexJ = j;
					shapes[grabIndexI][grabIndexJ].moveTo(destinationIndexI,destinationIndexJ);
					shapes[destinationIndexI][destinationIndexJ].moveTo(grabIndexI,grabIndexJ);
					var tempShape = shapes[destinationIndexI][destinationIndexJ];
					shapes[destinationIndexI][destinationIndexJ] = shapes[grabIndexI][grabIndexJ];
					shapes[grabIndexI][grabIndexJ] = tempShape;

					movingShapes.push(shapes[grabIndexI][grabIndexJ]);
					movingShapes.push(shapes[destinationIndexI][destinationIndexJ]);
					
					// grabIndexIPos = shapes[grabIndexI][grabIndexJ].x;
					// grabIndexJPos = shapes[grabIndexI][grabIndexJ].y;
					// destinationIndexIPos = shapes[destinationIndexI][destinationIndexJ].x;
					// destinationIndexJPos = shapes[destinationIndexI][destinationIndexJ].y;
					// console.log(destinationIndexI+", "+destinationIndexJ);
					window.removeEventListener('mousemove', mouseMoveListener, false);
					window.removeEventListener('touchmove', touchMoveListener, false);
					window.removeEventListener('mouseup', mouseUpListener, false);
					window.removeEventListener('touchend', touchUpListener, false);

				}
			}
		}
	}
	// console.log(grabIndexI+", "+grabIndexJ);
	// console.log(mouseX);
	// console.log(mouseY);

}


function touchMoveListener(evt){
	evt.preventDefault();	evt.stopPropagation();
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	mouseX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	var i;
	var j;
	for (i=0; i < shapes.length; ++i) {
		for(j = 0; j < shapes[i].length; ++j){
			if (shapes[i][j].hitTest(mouseX, mouseY)) {	
				if((grabIndexI!=i || grabIndexJ!=j) && 
					(Math.abs(grabIndexI-i)==1) || 
					(Math.abs(grabIndexJ-j)==1)){
					destinationIndexI = i;
					destinationIndexJ = j;
					shapes[grabIndexI][grabIndexJ].moveTo(destinationIndexI,destinationIndexJ);
					shapes[destinationIndexI][destinationIndexJ].moveTo(grabIndexI,grabIndexJ);
					var tempShape = shapes[destinationIndexI][destinationIndexJ];
					shapes[destinationIndexI][destinationIndexJ] = shapes[grabIndexI][grabIndexJ];
					shapes[grabIndexI][grabIndexJ] = tempShape;

					movingShapes.push(shapes[grabIndexI][grabIndexJ]);
					movingShapes.push(shapes[destinationIndexI][destinationIndexJ]);
					// console.log(destinationIndexI+", "+destinationIndexJ);
					window.removeEventListener('mousemove', mouseMoveListener, false);
					window.removeEventListener('touchmove', touchMoveListener, false);
					window.removeEventListener('mouseup', mouseUpListener, false);
					window.removeEventListener('touchend', touchUpListener, false);

				}
			}
		}
	}

}

function mouseUpListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	// console.log(mouseX);
	// console.log(mouseY);	
	window.removeEventListener('mousemove', mouseMoveListener, false);
	window.removeEventListener('touchmove', touchMoveListener, false);
	window.removeEventListener('mouseup', mouseUpListener, false);
	window.removeEventListener('touchend', touchUpListener, false);
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
	theCanvas.addEventListener('touchstart', touchDownListener, false);
}

function touchUpListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	var touches = evt.changedTouches;
	mouseX = (touches[0].pageX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (touches[0].pageY - bRect.top)*(theCanvas.height/bRect.height);
	// console.log(mouseX);
	// console.log(mouseY);	
	window.removeEventListener('mousemove', mouseMoveListener, false);
	window.removeEventListener('touchmove', touchMoveListener, false);
	window.removeEventListener('mouseup', mouseUpListener, false);
	window.removeEventListener('touchend', touchUpListener, false);
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
	theCanvas.addEventListener('touchstart', touchDownListener, false);
}



function fillCountBoard(){
	var i;
	var j;
	for(i=0; i < shapes.length; ++i){
		for(j = 0; j < shapes[i].length; ++j){
			if(countBoard[i][j]==0){
				var count = DFS(i,j,shapes[i][j].type);
				DFSFill(i,j,shapes[i][j].type,count);
			}
		}
	}
}

function cleanBoard(){
	var hasClean = 0;
	var i;
	var j;
	for(i=0; i < shapes.length; ++i){
		var dropCount = 0;
		for(j = shapes[i].length-1; j >=0 ; --j){
			dropBoard[i][j] = dropCount;
			if(countBoard[i][j] >= scoreCount){
				++hasClean;
				shapes[i][j].explode();
				explodingShapes.push(shapes[i][j]);
				shapes[i][j] = undefined;
				++dropCount;
			}
			countBoard[i][j] = 0;
		}
	}
	for(i=0; i < shapes.length; ++i){
		for(j = shapes[i].length-1; j >=0 ; --j){
			if(dropBoard[i][j] > 0 && shapes[i][j]!=undefined){
				shapes[i][j+dropBoard[i][j]] = shapes[i][j];
				shapes[i][j] = undefined;
				shapes[i][j+dropBoard[i][j]].moveTo(i,j+dropBoard[i][j]);
				movingShapes.push(shapes[i][j+dropBoard[i][j]]);
			}
			dropBoard[i][j] = 0;
		}
	}
	for(i=0; i < shapes.length; ++i){
		for(j = shapes[i].length-1; j >=0 ; --j){
			if(shapes[i][j] == undefined){
				var tempType = Math.floor(Math.random()*5);
				shapes[i][j] = new SimpleSquareParticle(i, j, tempType);
				movingShapes.push(shapes[i][j]);	
			}
		}
	}
	return hasClean;
}
var dfsVec = [[0,1],[1,0],[0,-1],[-1,0]];
function DFS(i, j, type){
	var ni;
	var nj;
	var sum = 0;
	var k;
	countBoard[i][j] = -1;
	for(k = 0; k < dfsVec.length; ++k){
		ni = i + dfsVec[k][0];
		nj = j + dfsVec[k][1];
		if(ni >= 0 && ni <shapes.length && nj >= 0 && nj < shapes[0].length
			&& shapes[ni][nj].type == type && countBoard[ni][nj]==0){
			sum += DFS(ni, nj, type);
		}
	}
	countBoard[i][j] = sum+1;
	return sum+1;
}

function DFSFill(i, j, type, count){
	var ni;
	var nj;
	var k;
	countBoard[i][j] = count;
	for(k = 0; k < dfsVec.length; ++k){
		ni = i + dfsVec[k][0];
		nj = j + dfsVec[k][1];
		if(ni >= 0 && ni <shapes.length && nj >= 0 && nj < shapes[0].length
			&& shapes[ni][nj].type == type && countBoard[ni][nj]<count){
			DFSFill(ni, nj, type,count);
		}
	}
}

function onTimerTick(){
	// if(grabIndexI != undefined && destinationIndexI != undefined){
	// 	var grabShape = shapes[grabIndexI][grabIndexJ];
	// 	var desShape = shapes[destinationIndexI][destinationIndexJ];

	// 	grabShape.x = grabShape.x + easeAmount*(grabShape.moveToX - grabShape.x);
	// 	grabShape.y = grabShape.y + easeAmount*(grabShape.moveToY - grabShape.y);
	// 	desShape.x = desShape.x + easeAmount*(desShape.moveToX - desShape.x);
	// 	desShape.y = desShape.y + easeAmount*(desShape.moveToY - desShape.y);
	// 	if((Math.abs(grabShape.x - grabShape.moveToX) < 0.1) && (Math.abs(grabShape.y - grabShape.moveToY) < 0.1)){
	// 		grabShape.x = grabShape.moveToX;
	// 		grabShape.y = grabShape.moveToY;
	// 		desShape.x = desShape.moveToX;
	// 		desShape.y = desShape.moveToY;
	// 		shapes[grabIndexI][grabIndexJ] = desShape;
	// 		shapes[destinationIndexI][destinationIndexJ] = grabShape;
	// 		theCanvas.addEventListener('mousedown', mouseDownListener, false);
	// 		grabIndexI = undefined;
	// 		grabIndexJ = undefined;
	// 		destinationIndexI = undefined;
	// 		destinationIndexJ = undefined;
	// 		// clearInterval(timer);
			
	// 	}
	// }
	var i;
	var stopingShapes = [];
	for(i = 0; i < movingShapes.length; ++i){
		movingShapes[i].x = movingShapes[i].x + easeAmount*(movingShapes[i].moveToX - movingShapes[i].x);
		movingShapes[i].y = movingShapes[i].y + easeAmount*(movingShapes[i].moveToY - movingShapes[i].y);
		if((Math.abs(movingShapes[i].x - movingShapes[i].moveToX) < 1) && (Math.abs(movingShapes[i].y - movingShapes[i].moveToY) < 1)){
			stopingShapes.push(i);
			movingShapes[i].x = movingShapes[i].moveToX;
			movingShapes[i].y = movingShapes[i].moveToY;
		}
	}
	for(i = stopingShapes.length -1; i>=0; --i){
		movingShapes.splice(stopingShapes[i],1);
	}
	stopingShapes = [];
	for(i = explodingShapes.length-1; i>=0; --i){
		explodingShapes[i].decreaseRadius(explodeEase);
		if(explodingShapes[i].getRadius()<5){
			stopingShapes.push(i);
		}
	}
	for(i = stopingShapes.length -1; i>=0; --i){
		explodingShapes.splice(stopingShapes[i],1);
	}

	if(movingShapes.length == 0 && !hasMousedoneHandler){
		hasMousedoneHandler = true;
		theCanvas.addEventListener('mousedown', mouseDownListener, false);
		theCanvas.addEventListener('touchstart', touchDownListener, false);
	}

	
	clock += 30;
	if(clock >= countDown){
		console.log(countDown);
		clearShapes();
		clock = clockOrigin;
	}
	drawScreen();
	checkDead();
}



function clearShapes(){
	fillCountBoard();
	var cleanCount = cleanBoard();
	if(cleanCount==0){
		isDamaged = true;
		health -= damage;
		damage*=1.1;
	}else{
		countDown *= speedUpRatio;
		health += cleanCount;
		score += cleanCount;
		scoreLabel.innerHTML = score;
		if(health>100){
			health = 100;
		}
	}
}

function checkDead(){
	if(health <= 0){
		theCanvas.style.display = "none";
		gameOverLabel.style.display = "block";
		restartButton.style.display = "block";
		clearInterval(timer);
	}
}

init();