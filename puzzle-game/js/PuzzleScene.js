class PuzzleScene extends Phaser.Scene {
    map;
    player;
    creature;


    preload() {
        this.load.image('tileset', '../assets/puzzle-tileset.png');
        this.load.spritesheet('creature', '../assets/player.png', {
            frameWidth: 24,
            frameHeight: 24
        });
        this.load.tilemapTiledJSON('tilemap', '../assets/testmap.json');
    }

    create() {
        this.map = this.make.tilemap({
            key: 'tilemap'
        });
        this.player = this.physics.add.group({
            defaultKey: 'creature',
            maxSize: 1
        })
        let landscape = this.map.addTilesetImage('puzzle-tileset', 'tileset');
        this.map.createStaticLayer('background', [landscape], 0, 0);
        this.map.createStaticLayer('wall', [landscape], 0, 0);
        this.map.createStaticLayer('player', [landscape], 0, 0);
        this.interactLayer = this.map.createDynamicLayer('drop-points', landscape, 0, 0);
        this.interactLayer.setCollisionByProperty({
            collides: true
        });
        this.exitLayer = this.map.createStaticLayer('goal', [landscape], 0, 0);
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.movePlayer(creature);
        }
    }

    movePlayer(creature) {
        creature.body.collideWorldBounds = true;
        creature.body.onWorldBounds = true;
        creature.enableBody(false, creature.x, creature.y, true, true);
        creature.rotation = rotation;
        this.physics.velocityFromRotation(creature.rotation, 500, creature.body.velocity);
        this.physics.add.collider(creature, this.interactLayer, this.changeDirection, null, this);
    }

    changeDirection(){

    }


}