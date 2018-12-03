var canvas;
var ctxs = {};
var images = {};
var frameNo = 0;
var winTime = -1000;
var currLevel = 0;


var messages = [
	["Once upon a time, there lived Bob the", 
	 "Adventurer. One beautiful night, he went", 
	 "[right] into a dark forest."],
	["He picked [up] all the orbs until there were", 
	"none [left]. That showed him the way further", 
	"into the forest."],
	["As he contiuned [down] deeper into the forest,", 
	 "he learned some useful skills.", 
	 "He learned to jump over obstacles.", 
	 "He couldn't jump over two at once though."],
	["He got oxygen tanks so he could breathe", 
	 "underwater. He however couldn't", 
	 "jump when he was there"],
	["He learned to push boxes.", 
	 "He could push any number of boxes, but not", 
	 "when he was standing in water.", 
	 "Sometimes, he had to [r]etry the puzzles", 
	 "when he made a mistake."],
	
	["He even got a sword and chopped his way", 
	 "through the forest."],
	["Everytime he got an orb though, he lost one", 
	 "of his skills. Red made him sacrifice his", 
	 "sword, green his jumping, yellow box pushing", 
	 "and blue his ability to be under water"],
	["Whenever the spirit showed him the way, he ", "remembered what he forgot."],
	["He learned a skill no orb could take from him.", "He learned to use his abilities at correct", 
	"times and give them up when their time came"],
	["Sometimes, it helped him to look at the", "problem from a different [p]erspective."],
	["It was the dark spirit of the forest", "that was playing games with adventurers"],
	["Congratulations!", "More levels coming soon,", "thanks for playing!"],
	["The challenges got progressively harder"],
	["He had to sacrifice his skills at correct times"],
	["He always made sure he would not need the skill", "for a while before taking the orb."],
	["Bob was getting tired.", "The forest seemed to have no end."],
	["He felt the spirit getting stronger."],
	["The spirit must be close, he thought."],
	["Bob reached a strange place. A big meadow", "with a huge tree in the middle."],
	["He approached it. As he got closer,", "the tree started moving."],
	['"Who are you!?" Bob screamed'],
	["I am the spirit of the forest,", "and I hope you have learned your lesson.", "Thanks for playing. See post-compo if you want more."]
];
maps = maps.map(function(a) {return a.map(function(b) {return b.split("")})});
var playerPos = {x: 0, y: 0};
var lastPlayerPos = {x: 0, y: 0};
var playerMove = 0;
var playerDir = 0;
var muted = false;
var playerMoveMax = 8;
var jumpin = false;
var map = maps[0];

var abilities = {chop: true, swim: true, jump: true, push: true};
var imgList = ["hero", "grass", "box", "rock", "water", "water2", "jumpspirit", "jumpspirit2", "swordspirit", "swordspirit2", "strenspirit","strenspirit2", "waterspirit", "waterspirit2", "spiritoff", "bush", "sword", "bighands", "biglegs", "oxtank", "scrolltexture", "scrolltop", "scrollbot", "scrollside"];
var audioList = ["water", "step", "jump", "get", "fall", "chop"];
var audio = {};
var trans = false;

function main() {
	canvas = $("canvas")[0];
	for (var c of []) {
		ctxs[c] = $("#" + c)[0].getContext("2d");
		ctxs[c].imageSmoothingEnabled = false;
		ctxs[c].msImageSmoothingEnabled = false;
		
	}
	
	for (var name of imgList) {
		images[name] = new Image();
		images[name].src = "graphics/" + name + ".png";
	}
	for (var name of audioList) {
		var a = new Audio();
		a.src = ("audio/" + name + ".wav");
		audio[name] = a;
	}
	$(document).keydown(function(e) {
		console.log(e.keyCode);
		playerDir = e.keyCode - 37;
		switch(e.keyCode) {
			case 37: move(-1, 0); break;
			case 38: move(0, -1); break;
			case 39: move(1, 0); break;
			case 40: move(0, 1); break;
			case 16: trans = true; drawMap(); break;
			case 82: restartLevel(); break;
			case 77: toggleMute(); break;
			case 80: rotate(); break;
			default: playerDir = -1;
		}
	})
	$(document).keyup(function(e) {
		if (e.keyCode === 16) {
			trans = false;
			drawMap();
		}
	})
	
	makeMap(currLevel);
	
	drawMap();
	
	update();
}

function toggleMute() {
	muted = !muted;
	for (var n of Object.keys(audio)) {
		audio[n].volume = (muted ? 0 : 1);
	}
}

function move(x, y) {
	if (playerMove < 0) {
		if (canGo(playerPos.x + x, playerPos.y + y, false)) {
			lastPlayerPos = JSON.parse(JSON.stringify(playerPos));
			playerPos.x += x;
			playerPos.y += y;
			audio.step.play();
			jumpin = false;
			playerMove = playerMoveMax;
			if (map[playerPos.y][playerPos.x] === "c" || map[playerPos.y][playerPos.x] === "u") {
				moveCrate(playerPos.x, playerPos.y);
			}
			if (map[playerPos.y][playerPos.x] === "w" && map[lastPlayerPos.y][lastPlayerPos.x] !== "w") {
				audio.water.play();
			}
		}
		else if (canGo(playerPos.x + 2*x, playerPos.y + 2*y, true) && abilities.jump) {
			lastPlayerPos = JSON.parse(JSON.stringify(playerPos));
			playerPos.x += 2*x;
			playerPos.y += 2*y;
			audio.jump.play();
			playerMove = playerMoveMax;
			jumpin = true;
		}
		if (map[playerPos.y][playerPos.x] === "b" && abilities.chop) {
			map[playerPos.y][playerPos.x] = " ";
			audio.chop.play();
		}
		if (["j", "s", "h", "m"].indexOf(map[playerPos.y][playerPos.x]) > -1) {
			var abCode = map[playerPos.y][playerPos.x];
			abilities[{s: "chop", m: "swim", j: "jump", h: "push"}[abCode]] = false;
			map[playerPos.y][playerPos.x] = "f";
			audio.get.play();
			for (var i in map) {
				var row = map[i];
				for (var j in row) {
					if (map[i][j] === abCode) {
						console.log("here");
						
						map[i][j] = "f";
						drawRow(i);
					}
				}
			}
			if (map.filter(function(a) {return a.filter(function(b) {return ["j", "s", "m", "h"].indexOf(b) > -1}).length}).length === 0) {
				victory();
			}
		}
	}
}

function victory() {
	console.log("win");
	winTime = frameNo;
}

function canGo(x, y, jump) {
	if (x < 0 || y < 0 || x > map[y].length || y > map.length) {
		return false;
	}
	var c = map[y][x];
	var p = nextPosInDir(x, y);
	
	return (
	       (
			c === " " || c === "t" || c === "j" || c === "s" || c === "m" || c === "h" || c === "f" || (
	          c === "b" && abilities.chop && !jump
		   ) || (
		      c === "w" && abilities.swim
		   ) || (
		     (c === "c" || c === "u") && 
			 abilities.push && 
			 canCrateGo(p.x, p.y) && 
			 !jump && 
			 map[playerPos.y][playerPos.x] !== "w"
		   )
         )	
		&& (
		    !(jump && map[playerPos.y][playerPos.x] === "w")
	       
		)
		);
}

function canCrateGo(x, y) {
	var c = map[y][x];
	var p = nextPosInDir(x, y);
	return (c === " " || c === "t" || c === "w" || ((c === "c" || c === "u") && canCrateGo(p.x, p.y)));
}

function nextPosInDir(x, y) {
	return {x: x + (playerDir - 1) * ((playerDir + 1) % 2), 
			y: y + (playerDir - 2) * (playerDir % 2)}
}

function moveCrate(x, y) {
	var p = nextPosInDir(x, y);
	if (map[y][x] === "u") {
		map[y][x] = "t";
	}
	else {
		map[y][x] = " ";
	}
	switch(map[p.y][p.x]) {
		case " ": map[p.y][p.x] = "c"; break;
		case "w": map[p.y][p.x] = "t"; audio.fall.play(); break;
		case "c": moveCrate(p.x, p.y); map[p.y][p.x] = "c"; break;
		case "u": moveCrate(p.x, p.y); map[p.y][p.x] = "u"; break;
		case "t": map[p.y][p.x] = "u"; break;
	}
	drawRow(p.y);
}

function makeMap(n) {
	$(".map").remove();
	
	map = JSON.parse(JSON.stringify(maps[n]));
	var r = 0;
	while (r < 10) {
		var c = $("<canvas id='map-" + r + "' class='map' width=800 height=600>")[0];
		ctxs["layer" + r] = c.getContext("2d");
		var ctx = ctxs["layer" + r];
		ctx.translate(-r * 16, r * 32);
		ctx.imageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
		ctx.translate(150, 250);
		ctx.scale(2, 2);
		$("body").append(c);
		
		if (map[r]) {
			var t = map[r].indexOf("a");
			if (t > -1) {
				playerPos = {x: t, y: +r};
				map[r][t] = " ";
			}
		}
		
		++r;
	}
	while (ctx["layer" + r++]) {
		ctx["layer" + r] = undefined;
	}
	
}

function drawRow(n) {
	var ctx = ctxs["layer" + n];
	ctx.clearRect(-500, -500, 1000, 1000);
	ctx.save();
	var row = map[n];
	for (var x in row) {
		var fx = 0;
		var fy = 0;
		var phase = frameNo - +n * 5 - +x * 2;
		if (phase < 60) {
			fy = Math.pow((60 - phase), 2) * .3;
			fx = (60 - phase) * (+x * 1)
		}
		if (winTime > 0) {
			fx = Math.pow(frameNo - winTime, 2) * .1;
		}
		ctx.translate(fx, fy);
		switch(row[x]) {
			case "c": ctx.drawImage(images.grass, 0, 0); drawThing(images.box, 0, -24, ctx);  break;
			case "r": ctx.drawImage(images.grass, 0, 0); drawThing(images.rock, 0, -24, ctx);  break;
			case "t": ctx.drawImage(images.water, 0, 0); ctx.drawImage(images.water2, 0, 8); ctx.drawImage(images.box, 0, -5);  break;
			case "u": ctx.drawImage(images.water, 0, 0); ctx.drawImage(images.water2, 0, 8); ctx.drawImage(images.box, 0, -5); drawThing(images.box, 0, -24, ctx);  break;
			case "j": ctx.drawImage(images.grass, 0, 0); ctx.drawImage(images["jumpspirit" + (Math.floor(frameNo / 40) % 2 ? "" : "2")], 0, -24);  break;
			case "h": ctx.drawImage(images.grass, 0, 0); ctx.drawImage(images["strenspirit" + (Math.floor(frameNo / 40) % 2 ? "" : "2")], 0, -24);  break;
			case "s": ctx.drawImage(images.grass, 0, 0); ctx.drawImage(images["swordspirit" + (Math.floor(frameNo / 40) % 2 ? "" : "2")], 0, -24);  break;
			case "m": ctx.drawImage(images.grass, 0, 0); ctx.drawImage(images["waterspirit" + (Math.floor(frameNo / 40) % 2 ? "" : "2")], 0, -24);  break;
			case "f": ctx.drawImage(images.grass, 0, 0); ctx.drawImage(images.spiritoff, 0, -24);  break;
			case "b": ctx.drawImage(images.grass, 0, 0); drawThing(images.bush, 0, -24, ctx);  break;
			case "w": ctx.drawImage(images.water, 0, 0); ctx.drawImage(images.water2, 0, 8); break;
			case " ": ctx.drawImage(images.grass, 0, 0); break;
		}
		ctx.translate(-fx, -fy);
		
		ctx.translate(32, 0);
	}
	ctx.restore();
	if (playerPos.y === n) {
		var a = alter();
		var ey = Math.min(0, -(80 - frameNo) * .1) - Math.pow((winTime > 0 ? winTime - frameNo : 0), 2) * .05;
		ctx.translate(32 * playerPos.x, 0)
		drawHero(5 + a.x, (row[playerPos.x] === "w" ? -5 : -21) + a.y + ey, ctx);
		if (map[playerPos.y][playerPos.x] === "w") {
			ctx.drawImage(images.water2, 0, 8);
		}
		ctx.translate(-32*playerPos.x, 0);
	}
}

function drawHero(x, y, ctx) {
	if (frameNo < 80) {
		ctx.globalAlpha = Math.max(0, (frameNo - 20) / 60);
	}
	if (winTime > 0) {
		ctx.globalAlpha = Math.max(0, (1 - ((frameNo - winTime) / 100)));
	}
	ctx.drawImage(images.hero, x, y);
	if (abilities.swim) {
		ctx.drawImage(images.oxtank, x, y);
	}
	if (abilities.push) {
		ctx.drawImage(images.bighands, x + 2, y + 10);
	}
	if (abilities.chop) {
		ctx.drawImage(images.sword, x + 21, y + (abilities.push ? 10 : 7));
	}
	if (abilities.jump) {
		ctx.drawImage(images.biglegs, x + 7, y + 22);
	}
	ctx.globalAlpha = 1;
}

function drawThing(img, x, y, ctx) {
	if (trans) {
		ctx.globalAlpha = .3;
	}
	ctx.drawImage(img, x, y);
	ctx.globalAlpha = 1;
}

function alter() {
	var diff = {x: playerPos.x - lastPlayerPos.x, y: playerPos.y - lastPlayerPos.y};
	var m = Math.max(0, playerMove / playerMoveMax);
	var jy = Math.floor(Math.max(0, playerMove) / 5) % 2;
	if (jumpin) {
		jy += (Math.pow(playerMoveMax/2 - playerMove, 2) - playerMoveMax * 4);
	}
	return {x: -diff.x * m * 32 + diff.y * m * 8, y: -diff.y * m * 16 + jy};
}

function update() {
	requestAnimationFrame(update);
	--playerMove;
	if (playerMove === 0) 
		jumpin = false;
	if (frameNo % 20 === 0 || frameNo < 200 || winTime > 0) 
		drawMap();
	if (frameNo - winTime > 100 && winTime > 0) {
		restart();
		makeMap(++currLevel);
	}	
	draw();
	++frameNo;
	
}

function restartLevel() {
	restart();
	makeMap(currLevel);
}

function restart() {
	winTime = -1000;
	frameNo = 0;
	playerPos = {x: 0, y: 0};
	abilities = {jump: true, push: true, swim: true, chop: true};
}

function drawScroll() {
	var ctx = $("#scroll")[0].getContext("2d");
	ctx.clearRect(0, 0, 1000, 1000);
	var rolledOut = Math.min(1, frameNo / 50);
	if (winTime > 0) {
		rolledOut = Math.max(0, 1 - (frameNo - winTime) / 50);
	}
	rolledOut = Math.max(rolledOut, 0.02);
	var height = 10;
	var maxw = 500;
	var leftx = 23 + rolledOut * (maxw);
	var rightx = 10;
	
	for (i = 0; i < (maxw / 16) * rolledOut; ++i) {
		for (var j = 0; j < height; ++j) {
			ctx.drawImage(images.scrolltexture, 26 + 16 * i, 26 + 16 * j);
		}
	}
	
	ctx.font = "18px pixelart";
	i = 0;
	for (var m of messages[currLevel]) {
		ctx.fillText(m, rightx + 30, 60 + 30 * i++);
	}
	ctx.clearRect(leftx + 10, 0, 1000, 1000);
	ctx.drawImage(images.scrolltop, rightx, 10);
	ctx.drawImage(images.scrolltop, leftx, 10);
	var i;
	for (i = 0; i < height; ++i) {
		ctx.drawImage(images.scrollside, rightx + 4, 26 + 16 * i);
		ctx.drawImage(images.scrollside, leftx + 4, 26 + 16 * i);
	}
	ctx.drawImage(images.scrollbot, rightx, 26 + 16 * i);
	ctx.drawImage(images.scrollbot, leftx, 26 + 16 * i);
	
}

function rotate() {
	var newMap = [];
	for (var i = 0; i < map.length; ++i) {
		var row = map[i];
		for (var j = 0; j < row.length; ++j) {
			var y = row.length - j - 1;
			if (!newMap[y]) {
				newMap[y] = [];
			}
			newMap[y][i] = row[j];
		}
	}
	map = newMap;
	var t = playerPos.x;
	playerPos.x = playerPos.y;
	playerPos.y = map.length - t - 1;
	drawMap();
}

function drawMap() {
	//ctx.background.save();
	for (var y in map) {
		/*var row = map[y];
		for (var x in row) {
			switch(row[x]) {
				case "b": ctx.boxes.drawImage(images.box, 0, -24);
				case " ": ctx.background.drawImage(images.grass, 0, 0); console.log("drawing on " + x + ":" + y);break;
			}
			ctx.translate(32, 0);
			
		}
		ctx.translate(-32 * row.length - 8, 16);*/
		drawRow(y);
	}
	//ctx.background.restore();
}

function draw() {
	fixMoveChange();
	
	drawScroll();
}

function fixMoveChange() {
	drawRow(playerPos.y);
	drawRow(lastPlayerPos.y);
	
	
}

//https://forum.jquery.com/topic/wait-until-all-images-are-loaded
function _loadimages(imgArr,callback) {
	//Keep track of the images that are loaded
	
	function _loadAllImages(callback){
		//Create an temp image and load the url
		var img = new Image();
		$(img).attr('src', "graphics/" + imgArr[imagesLoaded] + ".png");
		if (img.complete || img.readyState === 4) {
			// image is cached
			imagesLoaded++;
			//Check if all images are loaded
			if(imagesLoaded == imgArr.length) {
				//If all images loaded do the callback
				$("#preloader").remove();
				callback();
			} else {
				//If not all images are loaded call own function again
				$("#preloader").val(Math.floor(imagesLoaded / imgArr.length * 100));
				_loadAllImages(callback);
			}
		} else {
			$(img).load(function(){
				//Increment the images loaded variable
				imagesLoaded++;
				//Check if all images are loaded
				if(imagesLoaded == imgArr.length) {
					//If all images loaded do the callback
					$("#preloader").remove();
					callback();
				} else {
					//If not all images are loaded call own function again
					$("#preloader").val(Math.floor(imagesLoaded / imgArr.length * 100));
					_loadAllImages(callback);
				}
			});
		}
	};		
	_loadAllImages(callback);
}
var imagesLoaded = 0;
onload = function() {_loadimages(imgList, main)};