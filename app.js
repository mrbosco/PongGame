class Vector{
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    get len(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set len(val){
        const factor = val / this.len;
        this.x *= factor;
        this.y *= factor;
    }
}

class Rectangle{
    constructor(w, h){
        this.loc = new Vector;
        this.size = new Vector(w, h);
    }
    get leftLoc(){ return this.loc.x - this.size.x / 2; }
    get rightLoc(){  return this.loc.x + this.size.x / 2; }
    get topLoc(){ return this.loc.y - this.size.y / 2; }
    get bottomtLoc(){ return this.loc.y + this.size.y / 2; }
}

class Ball extends Rectangle{
    constructor(){
        super(20, 20);
        this.vel = new Vector;
    }
}

class Player extends Rectangle{
    constructor(){
        super(15,150);
        this.score = 0;
    }
}

class pongGame{
    constructor(gameWindow){
        this.gameWindow = gameWindow;
        this.context = gameWindow.getContext('2d');

        this.ball = new Ball;
        this.ball.loc.x = 100;
        this.ball.loc.y = 50;
        
        this.ball.vel.x = 100;
        this.ball.vel.y = 100;

        this.players = [
            new Player,
            new Player,
        ];

        this.players[0].loc.x = 40;
        this.players[1].loc.x = this.gameWindow.width - 40;
        this.players.forEach(player => {
            player.loc.y = this.gameWindow.height/2;
        })

        let timeLog;
        const callback = (ms) =>{
            if(timeLog)
                this.update((ms - timeLog) / 1000);
            timeLog = ms;
            requestAnimationFrame(callback);
        };
        callback();
        
        this.numPixel = 10;
        this.numbers = [
            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',
        ].map(str => {
            const scoreCanvas = document.createElement('canvas');
            scoreCanvas.height = this.numPixel * 5;
            scoreCanvas.width = this.numPixel * 3;
            const context = scoreCanvas.getContext('2d');
            context.fillStyle = '#fff';
            str.split('').forEach((fill, i) => {
                if (fill === '1') {
                    context.fillRect((i % 3) * this.numPixel, (i / 3 | 0) * this.numPixel, this.numPixel, this.numPixel);
                }
            });
            return scoreCanvas;
        });

        this.reset();
    }
    collision(player,  ball){
        if(player.leftLoc < ball.rightLoc && player.rightLoc > ball.leftLoc &&
        player.topLoc < ball.bottomtLoc && player.bottomtLoc > ball.topLoc){
            const len = ball.vel.len;
            ball.vel.x = -ball.vel.x;
            ball.vel.y += 300 * (Math.random() - .5);
            ball.vel.len = len * 1.05;
        }
    }
    draw(){
        this.context.fillStyle='#000000';
        this.context.fillRect(0, 0,  this.gameWindow.width, 
            this.gameWindow.height);

        this.drawRectangle(this.ball);
        this.players.forEach(player => this.drawRectangle(player));

        this.drawScore();
    }
    drawScore(){
        const alignment = this.gameWindow.width / 3;
        const cWidth = this.numPixel * 4;
        this.players.forEach((player, index) => {
            const numbers = player.score.toString().split('');
            const offset = alignment * (index + 1) - (cWidth * numbers.length / 2) + this.numPixel / 2;
            numbers.forEach((char, pos) => {
                this.context.drawImage(this.numbers[char|0], offset + pos * cWidth, 20);
            });
        });
    }
    drawRectangle(rectangle){
         this.context.fillStyle='#ffffff';
         this.context.fillRect(rectangle.leftLoc, rectangle.topLoc, 
            rectangle.size.x, rectangle.size.y);
    }
    start(){
        if(this.ball.vel.x === 0 && this.ball.vel.y === 0){
            this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1);
            this.ball.vel.y = 300 * (Math.random() * 2 - 1);
            this.ball.vel.len = 200;
        }
    }
    reset(){
        this.ball.loc.x = this.gameWindow.width/2;
        this.ball.loc.y = this.gameWindow.height/2;
        
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
    }
    update(time){
        this.ball.loc.x +=  this.ball.vel.x * time;
        this.ball.loc.y +=  this.ball.vel.y * time;
    
        if( this.ball.leftLoc < 0 ||  this.ball.rightLoc >  this.gameWindow.width){
            const playerID = this.ball.vel.x < 0 | 0;
            this.ball.vel.x =- this.ball.vel.x;
            this.players[playerID].score++;
            this.reset();
        }
    
        if( this.ball.topLoc < 0 ||  this.ball.bottomtLoc >  this.gameWindow.height)
            this.ball.vel.y =-  this.ball.vel.y;

        this.players[1].loc.y = this.ball.loc.y;
        this.players.forEach(player => this.collision(player, this.ball));
    
        this.draw();
    }
}

const gameWindow = document.getElementById('gameCanvas');
const game = new pongGame(gameWindow);

gameWindow.addEventListener('mousemove', event => {
    const scaling = event.offsetY / event.target.getBoundingClientRect().height;
    game.players[0].loc.y = gameWindow.height * scaling;
})

gameWindow.addEventListener('click', event => {
    game.start();
})