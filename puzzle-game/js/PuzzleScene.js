class PuzzleScene extends Phaser.Scene {
    map;
    player;
    leftBlock;
    rightBlock;
    wallLayer;
    interactLayer;
    exitLayer;
    uiScene;
    constructor() {
        super("GameScene");
    }

    init(data) {
        this.music = new AudioManager(this);
        this.sfx = new AudioManager(this);

        if (data.music) {
            this.music.volume = data.music.volume;
            this.music.muted = data.music.muted;
        }
        if (data.sfx) {
            this.sfx.volume = data.sfx.volume;
            this.sfx.muted = data.sfx.muted;
        }
    }

    preload() {
        this.load.image('tileset', 'assets/game/puzzle-tileset.png');
        this.load.image('player', 'assets/game/player.png', {
            frameWidth: 24,
            frameHeight: 24
        });
        this.load.image('left-block', 'assets/game/left-block.png')
        this.load.image('right-block', 'assets/game/right-block.png')
        this.load.image('up-block', 'assets/game/up-block.png')
        this.load.image('down-block', 'assets/game/down-block.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/game/testmap.json');
    }

    create() {
        this.leftBlocks = this.physics.add.staticGroup();
        this.rightBlocks = this.physics.add.staticGroup();
        this.upBlocks = this.physics.add.staticGroup();
        this.downBlocks = this.physics.add.staticGroup();
        this.map = this.make.tilemap({
            key: 'tilemap'
        });
        let landscape = this.map.addTilesetImage('puzzle-tileset', 'tileset');
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.map.createStaticLayer('background', landscape, 0, 0);
        this.wallLayer = this.map.createStaticLayer('wall', landscape, 0, 0);
        this.wallLayer.setCollisionByProperty({
            collides: true
        });
        this.interactLayer = this.map.createDynamicLayer('drop-points', landscape, 0, 0);
        this.interactLayer.setCollisionByProperty({
            collides: true
        });
        this.exitLayer = this.map.createStaticLayer('goal', landscape, 0, 0);
        this.map.getObjectLayer('objects').objects.forEach(function (object) {
            object = this.retrieveCustomProperties(object);
            if (object.type === "playerSpawner") {
                this.createPlayer(object);
            } else if (object.type === "leftBlock") {
                this.createLeftBlock(object);
            } else if (object.type === "rightBlock") {
                this.createRightBlock(object);
            } else if (object.type === "upBlock") {
                this.createUpBlock(object);
            } else if (object.type === "downBlock") {
                this.createDownBlock(object);
            }
        }, this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.camera = this.cameras.getCamera("");
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.height * this.map.tileHeight);
        this.createCollision();

        this.uiScene = this.scene.get("UIScene");
        this.scene.launch(this.uiScene);
        this.uiScene.createUIElements(this);
        this.music.addAudio('gameMusic', { loop: true });
        this.music.play('gameMusic');
        this.sfx.addAudio('success')
    }

    createPlayer(object) {
        this.player = this.physics.add.sprite(object.x, object.y, 'player');
        this.player.setCollideWorldBounds(true);
    }

    createLeftBlock(object) {
        this.leftBlocks.create(object.x, object.y, 'left-block')

    }

    createRightBlock(object) {
        this.rightBlocks.create(object.x, object.y, 'right-block')
    }

    createUpBlock(object) {
        this.upBlocks.create(object.x, object.y, 'up-block')
    }

    createDownBlock(object) {
        this.downBlocks.create(object.x, object.y, 'down-block')
    }

    createCollision() {
        let wallLayer = this.map.getLayer('wall').tilemapLayer;
        wallLayer.setCollisionBetween(0, 1000);
        this.physics.add.collider(this.player, wallLayer, this.resetPlayer, null, this);
        this.physics.add.collider(this.player, this.leftBlocks, this.turnLeft, null, this);
        this.physics.add.collider(this.player, this.rightBlocks, this.turnRight, null, this);
        this.physics.add.collider(this.player, this.upBlocks, this.goUp, null, this);
        this.physics.add.collider(this.player, this.downBlocks, this.goDown, null, this);
    }

    movePlayer(player) {
        player.body.collideWorldBounds = true;
        player.body.onWorldBounds = true;
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    turnLeft(player) {
        this.player.setAngle(180);
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    turnRight(player) {
        this.player.setAngle(0);
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    goUp(player) {
        this.player.setAngle(270);
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    goDown(player) {
        this.player.setAngle(90);
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    resetPlayer() {
        this.player.destroy();
        this.create();
    }

    retrieveCustomProperties(object) {
        if (object.properties) { //Check if the object has custom properties
            if (Array.isArray(object.properties)) { //Check if from Tiled v1.3 and above
                object.properties.forEach(function (element) { //Loop through each property
                    this[element.name] = element.value; //Create the property in the object
                }, object); //Assign the word "this" to refer to the object
            } else {  //Check if from Tiled v1.2.5 and below
                for (var propName in object.properties) { //Loop through each property
                    object[propName] = object.properties[propName]; //Create the property in the object
                }
            }
            delete object.properties; //Delete the custom properties array from the object
        }
        return object; //Return the new object w/ custom properties
    }

    update() {
        this.player.enableBody = true;
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.movePlayer(this.player);
        }
        let tile = this.exitLayer.getTileAtWorldXY(this.player.x, this.player.y);
        if (tile) {
            switch (tile.index) {
                case 12:
                    this.processExit();
                    break;
            }
        }
    }

    processExit() {
        this.sfx.play('success');
        this.physics.pause();
    }

}

class UIScene extends Phaser.Scene {
    constructor() {
        super("UIScene");
    }

    createUIElements(gameScene) {
        this.gameScene = gameScene;

        this.playMenu = new Menu(this, 705, 0, 195, 1350, 'menuBox', [
            new Button(this, 10, 100, "playButton", function () {
                this.scene.gameScene.body.movePlayer();
            }),
        ]);
        this.add.existing(this.playMenu);
        this.playMenu.setVisible(true);
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    init(data) {
        this.music = new AudioManager(this);
        this.sfx = new AudioManager(this);

        if (data.music) {
            this.music.volume = data.music.volume;
            this.music.muted = data.music.muted;
        }

        if (data.sfx) {
            this.sfx.volume = data.sfx.volume;
            this.sfx.muted = data.sfx.muted;
        }
    }

    preload() {
        this.load.image('homeButton', 'assets/ui/home.png');
        this.load.image('menuButton', 'assets/ui/menu.png');
        this.load.image('crossButton', 'assets/ui/cross.png');
        this.load.image('muteButton', 'assets/ui/mute.png');
        this.load.image('playButton', 'assets/ui/play.png');
        this.load.image('resetButton', 'assets/ui/reset.png');
        this.load.image('settingsButton', 'assets/ui/settings.png');
        this.load.image('tickButton', 'assets/ui/tick.png');
        this.load.image('unmuteButton', 'assets/ui/unmute.png');
        this.load.image('volumeButton', 'assets/ui/volume.png');
        this.load.image('menuBox', 'assets/ui/menuBox.png');
        this.load.image('sliderBar', 'assets/ui/slider-bar.png');
        this.load.image('sliderDial', 'assets/ui/slider-dial.png');
        this.load.image('sliderOutline', 'assets/ui/slider-outline.png');

        this.load.audio("menuMusic", "assets/audio/menu-[AudioTrimmer.com].wav");
        this.load.audio("gameMusic", "assets/audio/promiso8bit-[AudioTrimmer.com].wav");
        this.load.audio("success", "assets/audio/success.wav");
    }

    create() {
        this.mainMenu = new Menu(this, 30, 30, config.width - 30, config.height - 20, 'menuBox', [
            this.titleText = this.add.text(100, 40, "Critter Escape", {
                font: '100px Forte',
                fill: '#d6d1a1'
            }),
            new Button(this, 30, 150, 'playButton', function () {
                this.scene.music.stopAll();
                this.scene.scene.start("GameScene", {
                    music: this.scene.music
                })
            }), this.menuText = this.add.text(240, 220, "Play", {
                font: '64px Forte',
                fill: '#d6d1a1'
            }),
            new Button(this, 27, 350, 'settingsButton', function () {
                this.scene.settingMenu.setVisible(true);
                this.scene.mainMenu.setVisible(false);
            }),
            this.menuText = this.add.text(240, 410, "Options", {
                font: '64px Forte',
                fill: '#d6d1a1'
            })
        ]);
        this.add.existing(this.mainMenu);
        this.settingMenu = new Menu(this, 30, 30, config.width - 30, config.height - 20, 'menuBox', [
            this.titleText = this.add.text(220, 40, "Options", {
                font: '100px Forte',
                fill: '#d6d1a1'
            }),
            new Button(this, 30, 150, 'homeButton', function () {
                this.scene.settingMenu.visible = false;
                this.scene.mainMenu.visible = true;
            }),
            this.menuText = this.add.text(240, 220, "Home", {
                font: '64px Forte',
                fill: '#d6d1a1'
            }),
            new Button(this, 30, 350, 'muteButton', function () {
                this.scene.music.toggleMute();
            }, true, true, !this.music.muted, 'unmuteButton'),
            this.menuText = this.add.text(240, 410, "Mute", {
                font: '64px Forte',
                fill: '#d6d1a1'
            }),
            // new Slider(this, 40, 600, 450, 60, "sliderOutline", "sliderDial", function () {
            //     this.scene.music.setVolume(this.percent / 100);
            // }),
            this.menuText = this.add.text(530, 600, "Volume", {
                font: '60px Forte',
                fill: '#d6d1a1'
            }),
            new MaskSlider(this, 40, 600, 450, 60, "sliderOutline", "sliderBar", "sliderDial", function () {
                this.scene.music.setVolume(this.percent / 100);
                this.scene.sfx.setVolume(this.percent / 100);
            }),
        ]);

        this.add.existing(this.settingMenu);
        this.settingMenu.setVisible(false)

        this.input.on('pointerup', function (pointer) {
            if (pointer.lastBtn) {
                pointer.lastBtn.clearTint();
            }
        });
        this.music.addAudio('menuMusic', { loop: true });
        this.music.play('menuMusic');
    }
}