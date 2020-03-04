class PuzzleScene extends Phaser.Scene {
    map;
    player;
    wallLayer;
    interactLayer;


    preload() {
        this.load.image('tileset', 'assets/puzzle-tileset.png');
        this.load.image('player', 'assets/player.png', {
            frameWidth: 24,
            frameHeight: 24
        });
        this.load.tilemapTiledJSON('tilemap', 'assets/testmap.json');
    }

    create() {
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
        //this.map.createStaticLayer('player', [landscape], 0, 0);
        this.interactLayer = this.map.createDynamicLayer('drop-points', landscape, 0, 0);
        this.interactLayer.setCollisionByProperty({
            collides: true
        });
        this.exitLayer = this.map.createStaticLayer('goal', landscape, 0, 0);
        this.map.getObjectLayer('objects').objects.forEach(function (object) {
            object = this.retrieveCustomProperties(object);
            if (object.type === "playerSpawner") {
                this.createPlayer(object);
            }
        }, this);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.camera = this.cameras.getCamera("");
        this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.height * this.map.tileHeight);
    }
    createPlayer(object) {
        this.player = this.physics.add.sprite(object.x, object.y, 'player');
        // this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.interactLayer, this.changeDirection, null, this);


    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.movePlayer(this.player);
            //this.player.update();
            let tile = this.wallLayer.getTileAtWorldXY(this.player.x, this.player.y);
            if(tile){
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
        player.enableBody(false, player.x, player.y, true, true);
        // player.rotation = rotation;
        this.physics.velocityFromRotation(player.rotation, 300, player.body.velocity);
       // this.physics.add.overlap(this.player, this.wallLayer, this.resetPlayer, null, this);
    }

    changeDirection() {

    }

    resetPlayer(player, tile) {
        player.disableBody(true, true);
       
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