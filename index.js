var theCanvas = document.getElementById("mainCanvas");
var gameOverLabel = document.getElementById("gameOverLabel");
var scoreLabel = document.getElementById("scoreLabel");
var context = theCanvas.getContext("2d");
var gridWidth = 8;
var gridHeight = 6;
var shapes = [];
var countBoard = [];
var dropBoard = [];
var grabIndexI;
var grabIndexJ;
var destinationIndexI;
var timer;
var easeAmount = 0.45;
var isDragging = false;
var scoreCount = 4;
var movingShapes = [];
var hasMousedoneHandler;
var countDown = 3000;
var clock = 0;
var health = 100;
var damage = 15;
var isDamaged = false;
var score=0;
var speedUpRatio = 0.96;

function init(){
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
	hasMousedoneHandler = true;
	makeShapes();
	drawShapes();
	timer = setInterval(onTimerTick, 1000/30);
}

function makeShapes() {
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
}
function drawScreen() {
	//bg
	if(isDamaged){
		context.fillStyle = "#FF0000";
		isDamaged = false;
	}else{
		context.fillStyle = "#FFFFFF";
	}
	context.fillRect(0,0,theCanvas.width,theCanvas.height);
	context.fillStyle = "#FF0000";
	context.fillRect(0,160,theCanvas.width*health/100,10);
	context.fillStyle = "#0000FF";
	context.fillRect(0,180,theCanvas.width*clock/countDown,10);

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
	console.log(grabIndexI+", "+grabIndexJ);
	
	window.addEventListener('mousemove', mouseMoveListener, false);
	window.addEventListener('mouseup', mouseUpListener, false);
	theCanvas.removeEventListener('mousedown', mouseDownListener, false);
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
					console.log(destinationIndexI+", "+destinationIndexJ);
					window.removeEventListener('mousemove', mouseMoveListener, false);
					window.removeEventListener('mouseup', mouseUpListener, false);
					

				}
			}
		}
	}
	// console.log(grabIndexI+", "+grabIndexJ);
	// console.log(mouseX);
	// console.log(mouseY);

}

function mouseUpListener(evt){
	var bRect = theCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	// console.log(mouseX);
	// console.log(mouseY);	
	window.removeEventListener('mousemove', mouseMoveListener, false);
	window.removeEventListener('mouseup', mouseUpListener, false);
	theCanvas.addEventListener('mousedown', mouseDownListener, false);
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
		if((Math.abs(movingShapes[i].x - movingShapes[i].moveToX) < 0.1) && (Math.abs(movingShapes[i].y - movingShapes[i].moveToY) < 0.1)){
			stopingShapes.push(i);
			movingShapes[i].x = movingShapes[i].moveToX;
			movingShapes[i].y = movingShapes[i].moveToY;
		}
	}
	for(i = stopingShapes.length -1; i>=0; --i){
		movingShapes.splice(stopingShapes[i],1);
	}
	if(movingShapes.length == 0 && !hasMousedoneHandler){
		hasMousedoneHandler = true;
		theCanvas.addEventListener('mousedown', mouseDownListener, false);
	}
	clock += 30;
	if(clock >= countDown){
		clearShapes();
		clock = 0;
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
		clearInterval(timer);
	}
}

init();