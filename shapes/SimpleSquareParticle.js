// Simple class example

var styles = [[255, 0, 0, 1]
			 ,[0, 200, 0, 1]
			 ,[0, 0, 255, 1]
			 ,[225, 225, 0, 1]
			 ,[0, 0, 0, 1]
			 ,[255, 255, 255, 0]];

function SimpleSquareParticle(posX, posY, type) {
		this.velX = 0;
		this.velY = 0;
		this.accelX = 0;
		this.accelY = 0;
		this.type = type;
		var tempColor = "rgba(" + styles[type][0] + "," + styles[type][1] + "," + styles[type][2] + "," + styles[type][3] + ")";
		// tempShape.color = tempColor;
		this.a = styles[type][3];
		this.color = tempColor;
		this.radius = 45;
		this.x = posX*(this.radius*2+4)+this.radius+5
		this.y = (posY-7)*(this.radius*2+4)+this.radius+5;
		this.moveToX = posX*(this.radius*2+4)+this.radius+5;
		this.moveToY = posY*(this.radius*2+4)+this.radius+5;
		this.posX = posX;
		this.posY = posY;
		this.isExploding = false;
}

//The function below returns a Boolean value representing whether the point with the coordinates supplied "hits" the particle.
SimpleSquareParticle.prototype.hitTest = function(hitX,hitY) {
	return((hitX > this.x - this.radius)&&(hitX < this.x + this.radius)&&(hitY > this.y - this.radius)&&(hitY < this.y + this.radius));
}

//A function for drawing the particle.
SimpleSquareParticle.prototype.drawToContext = function(theContext) {
	theContext.fillStyle = this.color;
	theContext.fillRect(this.x - this.radius, this.y - this.radius, 2*this.radius, 2*this.radius);
}

SimpleSquareParticle.prototype.moveTo = function(posX,posY){
	this.moveToX = posX*(this.radius*2+4)+this.radius+5;
	this.moveToY = posY*(this.radius*2+4)+this.radius+5;
	this.posX = posX;
	this.posY = posY;
}

SimpleSquareParticle.prototype.explode = function(){
	// this.type = 5;
	// var tempColor = "rgba(" + styles[this.type][0] + "," + styles[this.type][1] + "," + styles[this.type][2] + "," + 0 + ")";
	// this.color = tempColor;
	this.isExploding = true;
}

SimpleSquareParticle.prototype.decreaseRadius = function(explodeEase){
	this.radius *= explodeEase;
	this.a *= explodeEase;
	var tempColor = "rgba(" + styles[this.type][0] + "," + styles[this.type][1] + "," + styles[this.type][2] + "," + this.a + ")";
	this.color = tempColor;
}

SimpleSquareParticle.prototype.setRadius = function(newRadius){
	this.radius = newRadius;
}

SimpleSquareParticle.prototype.getRadius = function(){
	return this.radius;
}