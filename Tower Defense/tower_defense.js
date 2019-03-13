function init() {
    console.info("page loaded");

    let stage = new createjs.Stage("game");

    const FPS = 60;
    const WIDTH = 720;
    const HEIGHT = 540;

    const TOWERS_INFO = [
        {width: 40, height: 40, range: 120, damage: 30, dps: 1, cost: 40},
        {width: 70, height: 40, range: 130, damage: 100, dps: 2, cost: 60},
        {width: 30, height: 60, range: 170, damage: 20, dps: 0.45, cost: 60,}
        ];

    let towers = [];
    let enemies = [];
    let shots = [];

    let choosen_tower = -1;
    let money = 200;
    let total_enemies = 100;
    let enemy_hp = 100;
    let player_hp = 3;
    let color = 0;
    let dead = 0;

    let text = new createjs.Text("Money: " + money, "20px Arial");

    let ticks = 0;

    let circle = new createjs.Shape();

    let game_started = false;

    //--------------------------Tower--------------------------
    class Tower {
        constructor(n, x, y) {
            this.width = TOWERS_INFO[n].width;
            this.height = TOWERS_INFO[n].height;
            this.x = x;
            this.y = y;
            this.img = new createjs.Container();
            this.range = TOWERS_INFO[n].range;
            this.damage = TOWERS_INFO[n].damage;
            this.cost = TOWERS_INFO[n].cost;
            this.dps = TOWERS_INFO[n].dps;
            this.tick = 0;
            this.tower_type = n;
            stage.addChild(this.img);
        }

        shoot() {
            let shot = new Shot(this.target, this.damage, this.x, this.y);
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
            if (this.tower_type === 0) {
                let base = new createjs.Shape();
                base.graphics.beginFill("#ff0000").drawRect(this.x - this.width * 0.5,
                    this.y - this.height * 0.5, this.width, this.height);

                let roof = new createjs.Shape();
                roof.graphics.beginFill("DarkRed").moveTo(this.x - this.width * 0.5, this.y - this.height * 0.5).
                lineTo(this.x + this.width * 0.5, this.y - this.height * 0.5).
                lineTo(this.x, this.y - this.height).
                lineTo(this.x - this.width * 0.5, this.y - this.height * 0.5);

                let window = new createjs.Shape();
                base.graphics.beginFill("#caf0cf").drawRect(this.x - this.width * 0.2,
                    this.y - this.height * 0.2, this.width * 0.4, this.height * 0.4);

                this.img.addChild(base, roof, window);

            } else if (this.tower_type === 1) {
                let base = new createjs.Shape();
                base.graphics.beginFill("#00ff00").drawRect(this.x - this.width * 0.5,
                    this.y - this.height * 0.5, this.width, this.height);

                let roof = new createjs.Shape();
                roof.graphics.beginFill("#ff9266").drawEllipse(this.x - this.width * 0.5, this.y - this.height,
                    this.width, this.height);

                let window = new createjs.Shape();
                window.graphics.beginFill("#77aeff").drawRect(this.x - this.width * 0.4,
                    this.y - this.height * 0.2, this.width * 0.8, this.height * 0.4);

                this.img.addChild(roof, base, window);

            } else if (this.tower_type === 2) {
                let base = new createjs.Shape();
                base.graphics.beginFill("#0000ff").drawRect(this.x - this.width * 0.5,
                    this.y - this.height * 0.5, this.width, this.height);

                let door = new createjs.Shape();
                door.graphics.beginFill("#50ffc8").drawRect(this.x - this.width * 0.25,
                    this.y + this.height * 0.2, this.width * 0.5, this.height * 0.3).
                drawCircle(this.x, this.y + this.height * 0.2, this.width * 0.25);

                let window = new createjs.Shape();
                window.graphics.beginFill("#77aeff").drawRect(this.x - this.width * 0.15,
                    this.y - this.height * 0.15, this.width * 0.3, this.width * 0.3);

                let roof = new createjs.Shape();
                roof.graphics.beginFill("#0000ff").drawRect(this.x - this.width * 0.5, this.y - this.height * 0.65,
                    this.width * 0.4, this.height * 0.2).
                drawRect(this.x + this.width * 0.1, this.y - this.height * 0.65,
                    this.width * 0.4, this.height * 0.2);

                this.img.addChild(roof, base, door, window);
            }
        }
    }

    //--------------------------Enemy--------------------------
    class Enemy {
        constructor(x, y) {
            this.width = 30;
            this.height = 30;
            this.x = x;
            this.y = y;
            this.img = new createjs.Shape();
            this.hp = enemy_hp;
            this.speed = 20;
            this.award = 5;
            this.dead = false;
            this.color = color;
            stage.addChild(this.img);
        }

        move() {
            if (this.x > 100 - 1.5 * this.width &&
                this.x < 100 + 1.5 * this.width &&
                this.y > -100 && this.y < 0.8 * HEIGHT)
                    this.y += 1;
            else if (this.x >= 100 - 1.5 * this.width &&
                    this.x < 260 + 1.5 * this.width &&
                    this.y >= 0.8 * HEIGHT)
                    this.x += 1;
            else if (this.x >= 260 + 1.5 * this.width &&
                    this.y > 0.4 * HEIGHT)
                this.y -= 1;
            else
                this.x += 1;
        }

        isDead() {
            if (this.dead) {
                this.img.graphics.clear();
                money += this.award;
                total_enemies--;
                dead++;
                if (total_enemies % 10 === 0) {
                    color += 25;
                    enemy_hp += 45;
                }
            }
            return this.dead;
        }

        draw() {
            this.img.graphics.clear().beginFill("rgba(" + this.color + ",0,0,1)").drawPolyStar(this.x, this.y, this.width, 12,
                0.6, 90 * ticks / (FPS));
        }
    }

    //---------------------------Shot---------------------------
    class Shot {
        constructor(target, dmg, x, y) {
            this.x = x;
            this.y = y;
            this.damage = dmg;
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

    function draw_stage() {
        let bg = new createjs.Shape();
        bg.graphics.beginFill("#9a8758").drawRect(0, 0, WIDTH, HEIGHT);

        let road = new createjs.Shape();
        road.graphics.beginFill("#5c949a").drawRect(65, 0, 70, 0.8 * HEIGHT + 35).
        drawRect(135, 0.8 * HEIGHT - 35, 205, 70).drawRect(270, 0.4 * HEIGHT - 35, 70, 0.4 * HEIGHT).
        drawRect(270, 0.4 * HEIGHT - 35, 0.7 * WIDTH, 70);

        stage.addChild(bg, road);
    }
    function start() {
        let str = "Welcome to Tower Defense, Great Lord!\n";
        str += "Kill at least 100 enemies to WIN!\n";
        str += "But remember that they get stronger as they die!\n\n";
        str += "Press 1 to choose first tower (cost: " + TOWERS_INFO[0].cost + ")\n";
        str += "Cheap and balanced.\n\n";
        str += "Press 2 to choose second tower (cost: " + TOWERS_INFO[1].cost + ")\n";
        str += "High damage, but slow.\n\n";
        str += "Press 3 to choose third tower (cost: " + TOWERS_INFO[2].cost + ")\n";
        str += "Fast, long range, but low damage.\n\n";
        str += "Left click to build chosen tower\n\n";
        str += "Click to start.";
        let txt = new createjs.Text(str, "26px Arial");

        txt.x = (WIDTH - txt.getBounds().width)/ 2;
        txt.y = (HEIGHT - txt.getBounds().height)/ 2;

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
                if (evt.stageX <= WIDTH + towers[i].width * 0.5
                    && evt.stageX >= WIDTH - towers[i].width * 0.5
                    && evt.stageY <= HEIGHT + towers[i].height * 0.5
                    && evt.stageY >= HEIGHT - towers[i].height * 0.5
                    || evt.stageX <= towers[i].x + towers[i].width * 1.1
                    && evt.stageX >= towers[i].x - towers[i].width * 1.1
                    && evt.stageY <= towers[i].y + towers[i].height * 1.1
                    && evt.stageY >= towers[i].y - towers[i].height * 1.1)
                    return;
            }

            if (evt.stageX > 100 - 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageX < 100 + 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageY > -100 && evt.stageY < 0.8 * HEIGHT)
                return;
            else if (evt.stageX >= 100 - 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageX < 260 + 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageY >= 0.8 * HEIGHT - 1.1 * TOWERS_INFO[choosen_tower].height &&
                evt.stageY < 0.8 * HEIGHT + 1.1 * TOWERS_INFO[choosen_tower].height)
                return;
            else if (evt.stageX <= 290 + 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageX >= 290 - 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageY > 0.4 * HEIGHT - 1.1 * TOWERS_INFO[choosen_tower].height &&
                evt.stageY < 0.8 * HEIGHT + 1.1 * TOWERS_INFO[choosen_tower].height)
                return;
            else if (evt.stageX >  260 - 1.1 * TOWERS_INFO[choosen_tower].width &&
                evt.stageY > 0.4 * HEIGHT - 1.1 * TOWERS_INFO[choosen_tower].height &&
                evt.stageY < 0.4 * HEIGHT + 1.1 * TOWERS_INFO[choosen_tower].height)
                return;

            if (money < TOWERS_INFO[choosen_tower].cost)
                return;
            money -= TOWERS_INFO[choosen_tower].cost;
            text.text = " $ " + money + "\n❤ " + player_hp + "\n☠ " + dead ;
            let t = new Tower(choosen_tower, evt.stageX, evt.stageY);
            t.draw();
            towers.push(t);
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
            drawCircle(evt.stageX, evt.stageY, TOWERS_INFO[choosen_tower].range * 0.85);
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


        text.x = 650;
        text.y = 465;

        stage.addChild(circle);
        stage.addChild(text);

        stage.mouseMoveOutside = true;

        createjs.Ticker.addEventListener("tick", stage);
        createjs.Ticker.framerate = FPS;
        createjs.Ticker.timerMode = createjs.Ticker.RAF_SYNCHED;
        createjs.Ticker.addEventListener("tick", handleTick);

        function handleTick(event) {
            draw();
            text.text = " $ " + money + "\n❤ " + player_hp + "\n☠ " + dead ;

            // Counting ticks
            ticks += 1;
            if (ticks > FPS && total_enemies > 0) {
                ticks = 1;
                enemies.push(new Enemy(100, -50));
            }

            if (player_hp === 0) {
                createjs.Ticker.removeAllEventListeners("tick");
                text.text = "It's so sad, you lost!";
                text.x = 530;
                text.y = 500;
                stage.update();
            } else if (enemies.length === 0 && total_enemies <= 0) {
                text.text = "Congratulations, my \ngreat lord! You won!";
                text.x = 520;
                text.y = 485;
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
                    if (enemies[i].x > WIDTH + enemies[i].width)
                        player_hp--;
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

    stage.on("stagemousedown", function() {
        if (!game_started) {
            game_started = true;
            stage.removeAllChildren();
            draw_stage();
            play();
        }
    });

    start();
}
