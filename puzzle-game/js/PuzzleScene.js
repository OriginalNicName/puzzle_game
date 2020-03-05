var gameSize = (window.innerWidth > window.innerHeight) ? window.innerHeight : window.innerWidth;
var iOSOrientationChange = false;
var iOSDevice = false;

class PuzzleScene extends Phaser.Scene {
    map;
    player;
    leftBlock;
    rightBlock;
    wallLayer;
    interactLayer;


    preload() {
        this.load.image('tileset', 'assets/puzzle-tileset.png');
        this.load.image('player', 'assets/player.png', {
            frameWidth: 24,
            frameHeight: 24
        });
        this.load.image('left-block', 'assets/left-block.png')
        this.load.image('right-block', 'assets/right-block.png')
        this.load.tilemapTiledJSON('tilemap', 'assets/testmap.json');
    }

    create() {
        this.leftBlocks = this.physics.add.staticGroup();
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
            }
        }, this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.camera = this.cameras.getCamera("");
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.height * this.map.tileHeight);
        this.createCollision();
    }

    createPlayer(object) {
        this.player = this.physics.add.sprite(object.x, object.y, 'player');
        this.player.setCollideWorldBounds(true);
    }

    createLeftBlock(object) {
        this.leftBlocks.create(object.x, object.y, 'left-block')

    }

    createRightBlock(object) {
        this.rightBlock = this.physics.add.sprite(object.x, object.y, 'right-block').setImmovable();
    }

    createCollision() {
        let wallLayer = this.map.getLayer('wall').tilemapLayer;
        wallLayer.setCollisionBetween(0, 1000);
        this.physics.add.collider(this.player, wallLayer, this.resetPlayer, null, this);
        this.physics.add.collider(this.player, this.leftBlocks, this.turnLeft, null, this);
        this.physics.add.collider(this.player, this.rightBlocks, this.turnRight, null, this);
    }

    update() {
        this.player.enableBody = true;
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.movePlayer(this.player);
            let tile = this.wallLayer.getTileAtWorldXY(this.player.x, this.player.y);
            if (tile) {
                switch (tile.index) {
                    case 7:
                        this.resetPlayer();
                        break;
                }
            }
        }
    }

    movePlayer(player) {
        player.body.collideWorldBounds = true;
        player.body.onWorldBounds = true;
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    turnLeft(player) {
        console.log(this.player);
       this.player.setAngle(-90);
       this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
    }

    turnRight(player) {
        console.log(this.player);
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

}