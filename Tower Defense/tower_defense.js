function init() {
    console.info("page loaded");

    let stage = new createjs.Stage("game");

    const FPS = 60;
    const WIDTH = 720;
    const HEIGHT = 540;

    const TOWERS_INFO = [{width: 40, height: 40, color: "#ff0000", range: 100, damage: 50, dps: 1, cost: 30},
        {width: 50, height: 65, color: "#00ff00", range: 150, damage: 100, dps: 1, cost: 30},
        {width: 50, height: 55, color: "#0000ff", range: 170, damage: 70, dps: 0.5, cost: 50,}];

    let towers = [];
    let enemies = [];
    let shots = [];

    let choosen_tower = -1;
    let money = 200;

    let text = new createjs.Text("Money: " + money, "20px Arial");

    let ticks = 0;

    let circle = new createjs.Shape();

    let game_started = false;

    stage.on("stagemousedown", function() {
        if (!game_started) {
            game_started = true;
            stage.removeAllChildren();
            play();
        }
    });

    //--------------------------Tower--------------------------
    class Tower {
        constructor(n, x, y) {
            this.width = TOWERS_INFO[n].width;
            this.height = TOWERS_INFO[n].height;
            this.x = x;
            this.y = y;
            this.img = new createjs.Shape();
            this.range = TOWERS_INFO[n].range;
            this.damage = TOWERS_INFO[n].damage;
            this.cost = TOWERS_INFO[n].cost;
            this.dps = TOWERS_INFO[n].dps;
            this.tick = 0;
            this.tower_type = n;
            stage.addChild(this.img);
        }

        shoot() {
            let shot = new Shot(this.target, this.x, this.y);
            shots.push(shot);
        }

        detectEnemy() {
            if(enemies.length === 0) {
                this.target = null;
                return;
            }
            if(this.target && this.target.hp <= 0) {
                this.target = null;
            }
            for (let i = 0, j = enemies.length; i < j; i++) {
                let dist = (enemies[i].x - this.x) * (enemies[i].x - this.x) +
                    (enemies[i].y - this.y) * (enemies[i].y - this.y);
                if (dist <= this.range * this.range && this.tick === 1) {
                    this.target = enemies[i];
                    this.shoot(); //!!!
                    return;
                }
            }
        }

        draw() {
            this.img.graphics.beginFill(TOWERS_INFO[this.tower_type].color).drawRect(this.x - this.width * 0.5,
                this.y - this.height * 0.5, this.width, this.height);
        }
    }

    //--------------------------Enemy--------------------------
    class Enemy {
        constructor(x, y) {
            this.width = 40;
            this.height = 40;
            this.x = x;
            this.y = y;
            this.img = new createjs.Shape();
            this.hp = 100;
            this.speed = 20;
            this.award = 5;
            this.dead = false;
            stage.addChild(this.img);
        }

        move() {
            this.x += 1;
        }

        isDead() {
            if (this.dead) {
                this.img.graphics.clear();
                money += this.award;
            }
            return this.dead;
        }

        draw() {
            this.img.graphics.clear().beginFill("ffffff").drawRect(this.x - this.width * 0.5, this.y - this.height * 0.5,
                this.width, this.height);
        }
    }

    //---------------------------Shot---------------------------
    class Shot {
        constructor(target, x, y) {
            this.x = x;
            this.y = y;
            this.damage = 20;
            this.speed = 2;
            this.target = target;
            this.img = new createjs.Shape();
            this.img.graphics.beginFill("#99aa22").beginStroke(createjs.Graphics.getRGB(0,0,0)).drawCircle(this.x, this.y, 5);
            stage.addChild(this.img);
        }

        move() {
            let xDist = this.target.x-this.x;
            let yDist = this.target.y-this.y;
            let dist_q = Math.sqrt(xDist*xDist+yDist*yDist);
            this.x = this.x+this.speed*xDist/dist_q;
            this.y = this.y+this.speed*yDist/dist_q;
        }

        checkCollision() {
            if (this.x < this.target.x + this.target.width * 0.5 &&
                this.x > this.target.x - this.target.width * 0.5 &&
                this.y < this.target.y + this.target.height * 0.5  &&
                this.y > this.target.y - this.target.height * 0.5) {
                    this.target.hp -= this.damage;
                    if (this.target.hp <= 0)
                        this.target.dead = true;
                    this.img.graphics.clear();
                    return true;
            }
            return false;
        }

        draw() {
            this.img.graphics.clear().beginFill("#99aa22")
                .beginStroke(createjs.Graphics.getRGB(0,0,0)).drawCircle(this.x, this.y, 5);
        }
    }

    function draw() {
        for (let j=0; j<enemies.length; j++)
           enemies[j].draw();
        for (let k=0; k<shots.length; k++)
            shots[k].draw();

    }
    function start() {
        let txt = new createjs.Text("Click to start ", "20px Arial");
        txt.x = WIDTH / 2;
        txt.y = HEIGHT / 2;

        stage.addChild(txt);
        stage.update();
    }
    //--------------------------------------------------------------------
    //--------------------------------------------------------------------
    //--------------------------------------------------------------------
    function play() {
        // Add Tower
        stage.on("stagemousedown", function(evt) {
            if (choosen_tower === -1)
                return;
            for (let i = 0; i < towers.length; i++) {
                if (evt.stageX <= towers[i].x + towers[i].width * 0.95
                    && evt.stageX >= towers[i].x - towers[i].width * 0.95
                    && evt.stageY <= towers[i].y + towers[i].height * 0.95
                    && evt.stageY >= towers[i].y - towers[i].height * 0.95
                    || evt.stageX <= towers[i].width * 0.6
                    || evt.stageX >= WIDTH - towers[i].width * 0.6
                    || evt.stageY <= towers[i].height * 0.6
                    || evt.stageY >= HEIGHT - towers[i].height * 0.6)
                    return;
            }
            if (money < TOWERS_INFO[choosen_tower].cost)
                return;
            money -= TOWERS_INFO[choosen_tower].cost;
            text.text = "Money: " + money;
            let t = new Tower(choosen_tower, evt.stageX, evt.stageY);
            t.draw();
            towers.push(t);
            t.detectEnemy();
        });

        stage.on("stagemousemove", function(evt) {
            stage.canvas.style.cursor = "crosshair";
            if (evt.stageX === 0 || evt.stageY === 0 ||
                evt.stageX === WIDTH - 1 || evt.stageY === HEIGHT - 1) {
                circle.graphics.clear();
                return;
            }
            if (choosen_tower === -1)
                return;
            circle.graphics.clear().beginFill(createjs.Graphics.getRGB(0,0,0, 0.2)).
            drawCircle(evt.stageX, evt.stageY, TOWERS_INFO[choosen_tower].range * 0.95);
        });

        document.addEventListener("keydown",function(evt) {
            switch(evt.keyCode) {
                case 49:
                case 50:
                case 51:
                    choosen_tower = evt.keyCode - 49;
                    break;
            }
        });


        text.x = 590;
        text.y = 500;

        stage.addChild(circle);
        stage.addChild(text);

        stage.mouseMoveOutside = true;

        createjs.Ticker.addEventListener("tick", stage);
        createjs.Ticker.framerate = FPS;
        createjs.Ticker.timerMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener("tick", handleTick);

        function handleTick(event) {
            draw();
            text.text = "Money: " + money;

            // Counting ticks
            ticks += 1;
            if (ticks > FPS) {
                ticks = 1;
                enemies.push(new Enemy(200, 200));
            }

            // Actions carried out each tick (aka frame)
            for (let i = 0; i < towers.length; i++) {
                towers[i].detectEnemy();
                towers[i].tick += 1;
                if (towers[i].tick > FPS * towers[i].dps)
                    towers[i].tick = 1;
            }

            for (let k = 0; k < shots.length; k++) {
                shots[k].move();
            }

            for(let i = 0, j = shots.length; i < j; i++) {
                if(shots[i].checkCollision()) {
                    shots[i] = null;
                    shots.splice(i,1);
                    j--;
                    i--;
                }
            }

            for(let i = 0, j = enemies.length; i < j; i++) {
                if(enemies[i].isDead() || enemies[i].x > WIDTH + enemies[i].width) {
                    enemies[i] = null;
                    enemies.splice(i,1);
                    j--;
                    i--;
                } else
                    enemies[i].move();
            }

            if (!event.paused) {
                // Actions carried out when the Ticker is not paused.
            }
        }
    }

    start();
}
