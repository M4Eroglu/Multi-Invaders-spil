//const { each } = require("jquery");

// Player 1 KEYS
const KEY_CODE_LEFT = 37; // Left Arrow Key
const KEY_CODE_RIGHT = 39; // Right Arrow Key
const KEY_CODE_SHOOT = 13; // Enter Key

// Player 2 KEYS
const KEY_CODE_LEFT2 = 65; // 'A' Key
const KEY_CODE_RIGHT2 = 68; // 'D' Key
const KEY_CODE_SHOOT2 = 32; // Space Key

// Game Settings
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;
const PLAYER_WIDTH = 200;

// Weapon Settings
const SHOT_MAXSPEED = 100;
const SHOT_COOLDOWN = 0.5;

// Virus Settings
const VIRUS_PER_ROW = 10;
const VIRUS_PADDING_HORIZONTAL = 200;
const VIRUS_PADDING_VERTICAL = 100;
const VIRUS_SPACING_VERTICAL = 100;
const VIRUS_SHOT_COOLDOWN = 5.0;

// Global Variables
var life = 10;
var players = [];

// Game State
const GAME_STATE =
{
    P1_playerX: 0,
    P1_playerY: 0,
    P2_playerX: 0,
    P2_playerY: 0,

    P1_leftKeyPressed: false,
    P1_rightKeyPressed: false,
    P1_shootKeyPressed: false,

    P2_leftKeyPressed: false,
    P2_rightKeyPressed: false,
    P2_shootKeyPressed: false,
    
    P1_shotsArr: [],
    P1_PlayersCooldown: 0,

    P2_PlayersCooldown: 0,
    P2_shotsArr: [],

    prev_time: Date.now(),

    virus: [],
    virusShots: [],
    gameOver: false,
};

//Functions
function sendLives()
{
    document.getElementById("lives").innerHTML = life-1;
}

var gameMusic = document.getElementById("gameMusic");
gameMusic.volume = 0.2;
var isPlaying = false;

function togglePlay() {
    isPlaying ? gameMusic.pause() : gameMusic.play();
};

gameMusic.onplaying = function () {
    isPlaying = true;
};
gameMusic.onpause = function () {
    isPlaying = false;
};

function setPosition($el, x, y)
{
    $el.style.transform = `translate(${x}px, ${y}px)`;
}

function clamp(v, min, max)
{
    if (v < min)
    {
        return min;
    }
    else if (v > max)
    {
        return max;
    }
    else
    {
        return v;
    }
}

function rand(min, max)
{
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return min + Math.random() * (max - min);
}

function virusAndShotCollision(shotCol, virusCol)
{
    return !(virusCol.left > shotCol.right ||
        virusCol.right < shotCol.left ||
        virusCol.top > shotCol.bottom ||
        virusCol.bottom < shotCol.top);
}

function createPlayers($container)
{
    //Creating Player 1
    GAME_STATE.P1_playerX = GAME_WIDTH / 2 - GAME_WIDTH / 4;
    GAME_STATE.P1_playerY = GAME_HEIGHT - 350;
    const $player1 = document.createElement("img");
    $player1.src = "img/p1-karakter.png";
    $player1.className = "player";
    $container.appendChild($player1);
    setPosition($player1, GAME_STATE.P1_playerX, GAME_STATE.P1_playerY);
    players.push($player1);
 

    //Creating Player 2
    GAME_STATE.P2_playerX = GAME_WIDTH / 2 + GAME_WIDTH / 4;
    GAME_STATE.P2_playerY = GAME_HEIGHT - 350;
    const $player2 = document.createElement("img");
    $player2.src = "img/p2-karakter.png";
    $player2.className = "player2";
    $container.appendChild($player2);
    setPosition($player2, GAME_STATE.P2_playerX, GAME_STATE.P2_playerY);
    players.push($player2);
}

function RemovePlayer($container, player)
{
    $container.removeChild(player);
}

function gameOver()
{
    GAME_STATE.gameOver = true;
    const sound = new Audio("sounds/losemusic.ogg");
    sound.volume = 0.50;
    sound.play();
}

function updatePlayer1(time, $container)
{
    if (GAME_STATE.P1_leftKeyPressed)
    {
        GAME_STATE.P1_playerX -= time * 500;
    }
    if (GAME_STATE.P1_rightKeyPressed)
    {
        GAME_STATE.P1_playerX += time * 500;
    }

    GAME_STATE.P1_playerX = clamp(
        GAME_STATE.P1_playerX,
        PLAYER_WIDTH,
        GAME_WIDTH - PLAYER_WIDTH
    );

    if (GAME_STATE.P1_shootKeyPressed && GAME_STATE.P1_PlayersCooldown <= 0)
    {
        if (document.querySelector(".player") != null)
        {
            createShot1($container, GAME_STATE.P1_playerX, GAME_STATE.P1_playerY);
            GAME_STATE.P1_PlayersCooldown = SHOT_COOLDOWN;
        }
        
    }

    if (GAME_STATE.P1_PlayersCooldown > 0)
    {
        GAME_STATE.P1_PlayersCooldown -= time;
    }

    const $player1 = document.querySelector(".player");

    if ($player1 != null)
    {
        setPosition($player1, GAME_STATE.P1_playerX, GAME_STATE.P1_playerY);
    }
    
}

function updatePlayer2(time, $container)
{
    if (GAME_STATE.P2_leftKeyPressed)
    {
        GAME_STATE.P2_playerX -= time * 500;
    }
    if (GAME_STATE.P2_rightKeyPressed)
    {
        GAME_STATE.P2_playerX += time * 500;
    }

    GAME_STATE.P2_playerX = clamp(
        GAME_STATE.P2_playerX,
        PLAYER_WIDTH,
        GAME_WIDTH - PLAYER_WIDTH
    );

    if (GAME_STATE.P2_shootKeyPressed && GAME_STATE.P2_PlayersCooldown <= 0)
    {
        if (document.querySelector(".player2") != null)
        {
            createShot2($container, GAME_STATE.P2_playerX, GAME_STATE.P2_playerY);
            GAME_STATE.P2_PlayersCooldown = SHOT_COOLDOWN;
        }
    }

    if (GAME_STATE.P2_PlayersCooldown > 0)
    {
        GAME_STATE.P2_PlayersCooldown -= time;
    }

    const $player2 = document.querySelector(".player2");

    if ($player2 != null)
    {

        setPosition($player2, GAME_STATE.P2_playerX, GAME_STATE.P2_playerY);
    }
}

function createShot1($container, x, y)
{
    const $bullet1 = document.createElement("img")
    $bullet1.src = "img/p1-bullet.png";
    $bullet1.className = "bullet1";
    $container.appendChild($bullet1);
    const shot1 = { x, y, $bullet1 };
    GAME_STATE.P1_shotsArr.push(shot1);
    const sound = new Audio("sounds/playerShoot.ogg");
    sound.volume = 0.25;
    sound.play();
    setPosition($bullet1, x, y);
}

function createShot2($container, x, y)
{
    const $bullet2 = document.createElement("img")
    $bullet2.src = "img/p2-bullet.png";
    $bullet2.className = "bullet2";
    $container.appendChild($bullet2);
    const shot2 = { x, y, $bullet2 };
    GAME_STATE.P2_shotsArr.push(shot2);
    const sound = new Audio("sounds/playerShoot.ogg");
    sound.volume = 0.25;
    sound.play();
    setPosition($bullet2, x, y);
}

function updateShot1(time ,$container)
{
    const shots = GAME_STATE.P1_shotsArr;
    for (let i = 0; i < shots.length; i++)
    {
        const shot = shots[i];
        shot.y -= time * SHOT_MAXSPEED;
        if (shot.y < 0)
        {
            removeShot1($container, shot);
        }
        setPosition(shot.$bullet1, shot.x, shot.y);
        const shotCol = shot.$bullet1.getBoundingClientRect();
        const viruses = GAME_STATE.virus;

        for (let j = 0; j < viruses.length; j++)
        {
            const virus = viruses[j];
            if (virus.removed)
            {
                continue;
            }

            const virusCol = virus.$virus.getBoundingClientRect();
            if (virusAndShotCollision(shotCol, virusCol))
            {
                const colSound = new Audio("sounds/virusHit.ogg");
                colSound.volume = 0.25;
                colSound.play();
                removeShot1($container, shot);
                removeVirus($container, virus);
                break;
            }
        }
    }
    GAME_STATE.P1_shotsArr = GAME_STATE.P1_shotsArr.filter(e => !e.removed);
}

function updateShot2(time, $container)
{
    const shots = GAME_STATE.P2_shotsArr;
    for (let i = 0; i < shots.length; i++)
    {
        const shot = shots[i];
        shot.y -= time * SHOT_MAXSPEED;
        if (shot.y < 0)
        {
            removeShot2($container, shot);
        }
        setPosition(shot.$bullet2, shot.x, shot.y);
        const shotCol = shot.$bullet2.getBoundingClientRect();
        const viruses = GAME_STATE.virus;

        for (let j = 0; j < viruses.length; j++)
        {
            const virus = viruses[j];
            if (virus.removed)
            {
                continue;
            }

            const virusCol = virus.$virus.getBoundingClientRect();
            if (virusAndShotCollision(shotCol, virusCol))
            {
                const colSound = new Audio("sounds/virusHit.ogg");
                colSound.volume = 0.25;
                colSound.play();
                removeShot2($container, shot);
                removeVirus($container, virus);
                break;
            }
        }
    }
    GAME_STATE.P2_shotsArr = GAME_STATE.P2_shotsArr.filter(e => !e.removed);
}

function removeShot1($container, shot)
{
    $container.removeChild(shot.$bullet1);
    shot.removed = true;
}

function removeShot2($container, shot)
{
    $container.removeChild(shot.$bullet2);
    shot.removed = true;
}

function removeVirusShot($container, virusShot)
{
    $container.removeChild(virusShot.$virusShot);
    virusShot.removed = true;
}

function removeVirus($container, virus)
{
    $container.removeChild(virus.$virus);
    virus.removed = true;
}

function createVirus($container, x, y)
{
    const $virus = document.createElement("img")
    $virus.src = "img/virus-karakter.png";
    $virus.className = "virus";
    $container.appendChild($virus);
    const virus = { x, y, cooldown: rand(0.5, VIRUS_SHOT_COOLDOWN), $virus };
    GAME_STATE.virus.push(virus);
    setPosition($virus, x, y);
}

function updateVirus(time, $container)
{
    const deltaX = Math.sin(GAME_STATE.prev_time / 1000) * 50;
    const deltaY = Math.cos(GAME_STATE.prev_time / 1000) * 10;

    const viruses = GAME_STATE.virus;

    for (let i = 0; i < viruses.length; i++)
    {
        const virus = viruses[i];
        const x = virus.x + deltaX;
        const y = virus.y + deltaY;
        setPosition(virus.$virus, x, y);

        virus.cooldown -= time;
        if (virus.cooldown <= 0)
        { 
            createVirusShot($container, x, y);
            virus.cooldown = VIRUS_SHOT_COOLDOWN;
        }
    }

    GAME_STATE.virus = GAME_STATE.virus.filter(e => !e.removed);
}

function createVirusShot($container, x, y)
{
    const $virusShot = document.createElement("img")
    $virusShot.src = "img/virus-bullet.png";
    $virusShot.className = "virus-bullet";
    $container.appendChild($virusShot); 
    const virusShot = { x, y, $virusShot };
    GAME_STATE.virusShots.push(virusShot);
    setPosition($virusShot, x, y);
}

function updateLife() {
    life--;
    const lifeSound = new Audio("sounds/playerGetHit.ogg");
    lifeSound.volume = 0.25;
    lifeSound.play();
}
function updateVirusShot(time, $container)
{
    const virusShots = GAME_STATE.virusShots;
    
    for (let i = 0; i < virusShots.length; i++)
    {
        const virusShot = virusShots[i];
        virusShot.y += time * SHOT_MAXSPEED;

        if (virusShot.y > GAME_HEIGHT)
        {
            removeVirusShot($container, virusShot);
        }

        setPosition(virusShot.$virusShot, virusShot.x, virusShot.y);
        const shotCol = virusShot.$virusShot.getBoundingClientRect();
        const player = document.querySelector(".player");
        const player2 = document.querySelector(".player2");
        if (player != null)
        {
            const virusCol = player.getBoundingClientRect();
            if (virusAndShotCollision(shotCol, virusCol))
            {
                if (life > 1)
                {
                    updateLife();
                    sendLives();
                    removeVirusShot($container, virusShot);
                    
                }
                else
                {
                    sendLives();
                    RemovePlayer($container, player);
                    RemovePlayer($container, player2);
                    gameOver();
                }
            }

        }
        if (player2 != null) {
            const virusCol2 = player2.getBoundingClientRect();
            if (virusAndShotCollision(shotCol, virusCol2)) {

                if (life > 1)
                {
                    updateLife();
                    sendLives();
                    removeVirusShot($container, virusShot);
                 
                }
                else
                {
                    sendLives();
                    RemovePlayer($container, player);
                    RemovePlayer($container, player2);
                    gameOver();
                }
            }
        }
    }
    GAME_STATE.virusShots = GAME_STATE.virusShots.filter(e => !e.removed);
}

function gameWon()
{
    return GAME_STATE.virus.length === 0;
}

function init()
{
    const $container = document.querySelector(".game");
    createPlayers($container);

    const spacing = (GAME_WIDTH - VIRUS_PADDING_HORIZONTAL * 2) /
        (VIRUS_PER_ROW - 1);

    for (let i = 0; i < 3; i++)
    {
        const y = VIRUS_PADDING_VERTICAL + i * VIRUS_SPACING_VERTICAL;
        for (let j = 0; j < VIRUS_PER_ROW; j++)
        {
            const x = j * spacing + VIRUS_PADDING_HORIZONTAL;
            createVirus($container, x, y);
        }
    }
}

function update(e)
{
    const currentTime = Date.now();

    const time = (currentTime - GAME_STATE.prev_time) / 1000.0;

    if (GAME_STATE.gameOver)
    {
        document.querySelector(".game-over").style.display = "block";
        gameMusic.pause();
        return;
    }

    if (gameWon())
    {
        const wonMusic = new Audio("sounds/winmusic.ogg");
        gameMusic.pause();
        wonMusic.volume = 1;
        wonMusic.play();
        document.querySelector(".game-win").style.display = "block";
        return;
    }

    const $container = document.querySelector(".game");

    updatePlayer1(time, $container);
    updatePlayer2(time, $container);

    updateShot1(time, $container);
    updateShot2(time, $container);

    updateVirus(time, $container);
    updateVirusShot(time, $container);

    GAME_STATE.prev_time = currentTime;
 
    window.requestAnimationFrame(update);
}

function onKeyDown_Player1(e)
{
    if (e.keyCode === KEY_CODE_LEFT)
    {
        GAME_STATE.P1_leftKeyPressed = true;
    }
    else if (e.keyCode === KEY_CODE_RIGHT)
    {
        GAME_STATE.P1_rightKeyPressed = true;
    }
    else if (e.keyCode === KEY_CODE_SHOOT)
    {
        GAME_STATE.P1_shootKeyPressed = true;
    }
}

function onKeyUp_Player1(e)
{
    if (e.keyCode === KEY_CODE_LEFT)
    {
        GAME_STATE.P1_leftKeyPressed = false;
    }
    else if (e.keyCode === KEY_CODE_RIGHT)
    {
        GAME_STATE.P1_rightKeyPressed = false;
    }
    else if (e.keyCode === KEY_CODE_SHOOT)
    {
        GAME_STATE.P1_shootKeyPressed = false;
    }
}

function onKeyDown_Player2(e)
{
    if (e.keyCode === KEY_CODE_LEFT2)
    {
        GAME_STATE.P2_leftKeyPressed = true;
    }
    else if (e.keyCode === KEY_CODE_RIGHT2)
    {
        GAME_STATE.P2_rightKeyPressed = true;
    }
    else if (e.keyCode === KEY_CODE_SHOOT2)
    {
        GAME_STATE.P2_shootKeyPressed = true;
    }
}

function onKeyUp_Player2(e)
{
    if (e.keyCode === KEY_CODE_LEFT2)
    {
        GAME_STATE.P2_leftKeyPressed = false;
    }
    else if (e.keyCode === KEY_CODE_RIGHT2)
    {
        GAME_STATE.P2_rightKeyPressed = false;
    }
    else if (e.keyCode === KEY_CODE_SHOOT2)
    {
        GAME_STATE.P2_shootKeyPressed = false;
    }
}

init();
window.addEventListener("keydown", onKeyDown_Player1);
window.addEventListener("keyup", onKeyUp_Player1);
window.addEventListener("keydown", onKeyDown_Player2);
window.addEventListener("keyup", onKeyUp_Player2);
window.requestAnimationFrame(update);


