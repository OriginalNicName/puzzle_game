/**
 * A button sprite that can be used to enable basic interactive elements.
 * @extends Phaser.GameObjects.Sprite
 */
class Button extends Phaser.GameObjects.Sprite {
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param {number} x - The horizontal position of this Game Object in the world.
     * @param {number} y - The vertical position of this Game Object in the world.
     * @param {string} texture - The key of the Texture this Game Object will use to render with, as stored in the Texture Manager.
     * @param {function} callback - The function to call when the button is clicked.
     * @param {boolean?} enabled - (Optional) Whether the button is enabled or not. If not enabled the button cannot be clicked and is greyed out. Default true.
     * @param {boolean?} toggleable - (Optional) Whether the button is toggleable. If true, the button will swap between texture and toggleTexture when clicked. Default false.
     * @param {boolean?} toggleOn - (Optional) Whether a toggleable button is currently on (true) or off (false). Default true. 
     * @param {string?} toggleTexture - (Optional) The key of the Texture this Game Object will use to render with when toggled, as stored in the Texture Manager. Default null.
     */
    constructor(scene, x, y, texture, callback, enabled = true, toggleable = false, toggleOn = true, toggleTexture = null) {
        super(scene, x, y, texture);

        this.toggleable = toggleable;

        //If the button is toggleable, retrieve the other parameters needed to allow the Button to function.
        if (this.toggleable) {
            this.toggleOn = toggleOn;
            this.toggleTexture = toggleTexture;
        }

        //Set origin point of the Button to be top-left.
        this.setOrigin(0, 0);

        //Set whether the Button is enabled. If it's not, make it appear disabled by greying it out.
        this.enabled = enabled;
        if (!this.enabled) {
            this.setTint(0x5f5f5f);
        }

        //This event fires when the mouse gets released whilst over the sprite.
        this.setInteractive().on("pointerup", function () {
            if (this.enabled) {
                //Swap over all of the toggle settings if the Button is toggleable.
                if (this.toggleable) {
                    this.toggleOn = !this.toggleOn;

                    let tempTexture = this.texture;
                    this.setTexture(this.toggleTexture);
                    this.toggleTexture = tempTexture;
                }

                //Run the callback function provided with the Button as the context (this).
                callback.call(this);
            }
        });

        //This even fires when the mouse gets pressed down whilst over the sprite.
        this.on("pointerdown", function (pointer) {
            if (this.enabled) {
                pointer.lastBtn = this;
                this.setTint(0x00ffff);
            }
        });
    }
}

/**
 * A container for various GameObjects to go into a menu screen. All objects added
 * to the container will be positioned relative to the container's top left pixel.
 * 
 * Please note for making a menu actually work it will still need adding to the scene.
 * To do this call this.add.existing(new Menu(...)); or this.add.existing(menuName);
 * if a variable has already been created for the menu.
 * @extends Phaser.GameObjects.Container
 */
class Menu extends Phaser.GameObjects.Container {
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param {number} x - The horizontal position of this Container in the world.
     * @param {number} y - The vertical position of this Container in the world.
     * @param {number} w - The width of the Container in the world.
     * @param {number} h - The heigh of the Container in the world.
     * @param {string} backgroundTexture - The key of the Texture this Container will use to render with, as stored in the Texture Manager.
     * @param {[Phaser.GameObjects]} items - This is an array of Phaser.GameObjects. All elements in the array will be added as one of the Container's children.
     */
    constructor(scene, x, y, w, h, backgroundTexture, items) {
        super(scene, x, y);

        let backgroundBox = new Phaser.GameObjects.Sprite(scene, 0, 0, backgroundTexture);

        //Set the container to draw any child objects from the top left pixel.
        backgroundBox.setOrigin(0, 0);

        //Change size of the background texture, and therefore the container, to provided width and height.
        backgroundBox.setDisplaySize(w, h);

        //Create array of GameObjects.
        let childrenArray = [backgroundBox];

        //Loop through the items parameter, ultimately adding all elements to the Menu object.
        for (var i = 0; i < items.length; i++) {
            childrenArray.push(items[i]);
        }

        this.add(childrenArray);
    }
}

/**
 * A basic implementation of a Slider. Contains two components, outline and dial.
 * Outline is a sprite that acts as the min and max points of the Slider.
 * Dial is a draggable sprite that cannot move outside the min and max points.
 * @extends Phaser.GameObjects.Container
 */
class Slider extends Phaser.GameObjects.Container {
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param {number} x - The horizontal position of this Container in the world.
     * @param {number} y - The vertical position of this Container in the world.
     * @param {number} w - The width of the Container in the world.
     * @param {number} h - The heigh of the Container in the world.
     * @param {string} outlineTexture - The key of the Texture this Slider will use as its "bar outline" to render with, as stored in the Texture Manager.
     * @param {string} dialTexture - The key of the Texture this Slider's dial will use to render with, as stored in the Texture Manager.                
     * @param {function} callback - The function to call when the dial moves.
     */
    constructor(scene, x, y, w, h, outlineTexture, dialTexture, callback) {
        super(scene, x, y);

        //this.percent is used to store where on the bar the dial is at.
        this.percent = 100;

        let outline = new Phaser.GameObjects.Sprite(scene, 0, 0, outlineTexture);
        let dial = new Phaser.GameObjects.Sprite(scene, 0, 0, dialTexture);

        //Set origin point of both the outline and dial to be top-left.
        outline.setOrigin(0, 0);
        dial.setOrigin(0, 0);

        //Scale the outline to the specified width and height, then scale the dial by the same factor.
        outline.setDisplaySize(w, h);
        dial.setScale(outline.scaleX, outline.scaleY);

        //Find the minimum and maximum points on the bar. These are used later to lock the dial between these two points.
        dial.min = x - dial.displayWidth / 2;
        dial.max = w - dial.displayWidth / 2

        //Position the dial at the far right of the bar.
        dial.setPosition(w - dial.displayWidth / 2, dial.y - dial.displayHeight / 8);

        //Enable the dial to be draggable.
        dial.setInteractive();
        scene.input.setDraggable(dial);

        //Event that triggers when the dial is "dragged".
        //pointer is the mouse/finger pointer used. dragX is the location the mouse has dragged the dial to.
        //The context (this) is the dial.
        dial.on("drag", function (pointer, dragX) {
            if (dragX > this.max) {
                this.x = this.max;
                this.parentContainer.percent = 100;
            } else if (dragX < this.min) {
                this.x = this.min;
                this.parentContainer.percent = 0;
            } else {
                this.x = dragX;

                //100 * (x - min / x - max); will give us the position of the dial on the Slider as a percentage.
                //We also need to  -this.parentContainer.x from each side to account for the x position of the container in the world.
                //Lastly, truncate to make it a whole number.
                this.parentContainer.percent = Math.trunc(100 * (this.x - this.min - this.parentContainer.x) / (this.max - this.min - this.parentContainer.x));

                //If for whatever reason the value goes above or below 100 or 0, set them to be that.
                if (this.parentContainer.percent <= 0) {
                    this.parentContainer.percent = 0;
                } else if (this.parentContainer.percent >= 100) {
                    this.parentContainer.percent = 100;
                }
            }

            //Run the provided callback function with the Slider (being the dial's parentContainer) as the context.
            callback.call(this.parentContainer);
        });

        //Add both the outline and dial to the Slider.
        this.add([outline, dial]);
    }
}

/**
 * A more complex implementation of a Slider. Contains four components, outline, bar, dial and mask.
 * Outline is a sprite that acts as the min and max points of the Slider.
 * Bar is the visual display of the bar itself, that will be covered/uncovered by a mask as the dial moves.
 * Dial is a draggable sprite that cannot move outside the min and max points.
 * Mask is a BitmapMask laid over the Bar. As the dial moves so too will the mask to cover/uncover the bar.
 * 
 * To be honest masks are not built for Phaser.GameObjects.Containers from my experience trying this.
 * The moment a mask gets made as a BitmapMask it no longer remains attached to a Container, which causes
 * problems with positioning it properly. Can be sorted easily with a bit of hard coding but I would
 * obviously not recommend it. I will leave this as an example of the basic implementation although
 * the code itself is very cumbersome, so use at your own risk!
 */
class MaskSlider extends Phaser.GameObjects.Container {
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The Scene to which this Game Object belongs. A Game Object can only belong to one Scene at a time.
     * @param {number} x - The horizontal position of this Container in the world.
     * @param {number} y - The vertical position of this Container in the world.
     * @param {number} w - The width of the Container in the world.
     * @param {number} h - The heigh of the Container in the world.
     * @param {string} outlineTexture - The key of the Texture this Slider will use as its "bar outline" to render with, as stored in the Texture Manager.
     * @param {string} barTexture - The key of the Texture this Slider will use for the bar itself to render with, as stored in the Texture Manager. 
     * @param {string} dialTexture - The key of the Texture this Slider's dial will use to render with, as stored in the Texture Manager.                
     * @param {function} callback - The function to call when the dial moves.
     */
    constructor(scene, x, y, w, h, outlineTexture, barTexture, dialTexture, callback) {
        super(scene, x, y);

        //this.percent is used to store where on the bar the dial is at.
        this.percent = 100;

        let outline = new Phaser.GameObjects.Sprite(scene, 0, 0, outlineTexture);
        let bar = new Phaser.GameObjects.Sprite(scene, 0, 0, barTexture);
        let dial = new Phaser.GameObjects.Sprite(scene, 0, 0, dialTexture);
        let mask = new Phaser.GameObjects.Sprite(scene, 0, 0, barTexture);

        //Set origin point of all the GameObjects to be top-left.
        outline.setOrigin(0, 0);
        bar.setOrigin(0, 0);
        dial.setOrigin(0, 0);
        mask.setOrigin(0, 0);

        //Scale the outline to the specified width and height, then scale the other GameObjects by the same factor.
        outline.setDisplaySize(w, h);
        bar.setScale(outline.scaleX, outline.scaleY);
        dial.setScale(outline.scaleX, outline.scaleY);
        mask.setScale(outline.scaleX, outline.scaleY);

        //Attach the mask to the bar.
        mask.visible = false;
        bar.mask = new Phaser.Display.Masks.BitmapMask(scene, mask);
        mask.offSet = 0;

        //Find the minimum and maximum points on the bar. These are used later to lock the dial between these two points.
        dial.min = x - dial.displayWidth / 2;
        dial.max = w - dial.displayWidth / 2

        //Position the dial at the far right of the bar.
        dial.setPosition(w - dial.displayWidth / 2, dial.y - dial.displayHeight / 8);

        //Position the mask where it needs to be. As mentioned in the class descriptor, annoyingly masks
        //do not take on their container's location for some reason, so this is us manually placing it
        //where it needs to be. Not ideal, but bear in mind you may need to tweak some numbers here.
        mask.setPosition(dial.x + dial.displayWidth * 2 - mask.displayWidth, y + 20);

        //Enable the dial to be draggable.
        dial.setInteractive();
        scene.input.setDraggable(dial);

        //Event that triggers when the dial is "dragged".
        //pointer is the mouse/finger pointer used. dragX is the location the mouse has dragged the dial to.
        //The context (this) is the dial.
        dial.on("drag", function (pointer, dragX) {
            //Find the mask from the Slider's list of children.
            mask = this.parentContainer.list[3];

            if (dragX > this.max) {
                this.x = this.max;
                this.parentContainer.percent = 100;
                mask.setPosition(this.x + this.displayWidth * 2 - mask.displayWidth, mask.y);
            } else if (dragX < this.min) {
                this.x = this.min;
                this.parentContainer.percent = 0;
                mask.setPosition(this.x + this.displayWidth * 2 - mask.displayWidth, mask.y);
            } else {
                this.x = dragX;
                mask.setPosition(this.x + this.displayWidth * 2 - mask.displayWidth, mask.y);

                //100 * (x - min / x - max); will give us the Slider as a percentage;
                //Also - parentContainer.x from each side to account for the x position of the container;
                //Lastly truncate to make it a whole number.
                this.parentContainer.percent = Math.trunc(100 * (this.x - this.min - this.parentContainer.x) / (this.max - this.min - this.parentContainer.x));

                //If for whatever reason the value goes above or below 100 or 0, set them to be that.
                if (this.parentContainer.percent <= 0) {
                    this.parentContainer.percent = 0;
                } else if (this.parentContainer.percent >= 100) {
                    this.parentContainer.percent = 100;
                }
            }

            //Run the provided callback function with the Slider (being the dial's parentContainer) as the context.
            callback.call(dial.parentContainer);
        });

        //Add all GameObjects to the Slider.
        this.add([outline, bar, dial, mask]);
    }
}

class AudioManager {
    constructor(scene, volume = 1, muted = false) {
        this.scene = scene;
        this.volume = volume;
        this.muted = muted;
        this.previousVolume = volume;
        this.audioList = {};
    }

    addAudio(key, config = {}) {
        config.volume = this.volume;
        let audio = this.scene.sound.add(key, config);
        this.audioList[key] = audio;
    }

    play(key) {
        this.audioList[key].play();
    }

    setVolume(volume) {
        this.volume = volume;

        for (let sound of Object.values(this.audioList)) {
            sound.volume = volume;
        }
    }

    stopAll() {
        for (let sound of Object.values(this.audioList)) {
            sound.stop();
        }
    }

    mute() {
        this.muted = true;;
        this.previousVolume = this.volume;
        this.setVolume(0);
    }

    unmute() {
        this.muted = false
        this.setVolume(this.previousVolume);
    }

    toggleMute() {
        if (this.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
    /**
      * Begin playing the BaseSound of the key, provided it has been added to the AudioManager.
      * @param {string} key - The key of the sound that will begin playing
      */
    play(key) {
        this.audioList[key].play();
    }
    /**
     * Begin fading out the volume of the BaseSound.
     * @param {string} key - The key of the sound that will begin fading out.
     * @param {number} duration - (Optional) The time the fade out should take in milliseconds. Default 1000.
     */
    fadeOut(key, duration = 1000) {
        this.scene.tweens.add({
            targets: this.audioList[key],
            volume: 0,
            ease: "Linear",
            duration: duration,

            onComplete: function (tween) {
                tween.targets[0].stop();
            }
        });
    }

    /**
     * Begin fading in the volume of the BaseSound.
     * @param {string} key - The key of the sound that will begin fading in.
     * @param {number} duration - (Optional) The time the fade in should take in milliseconds. Default 1000.
     */
    fadeIn(key, duration = 1000) {
        this.scene.tweens.add({
            targets: this.audioList[key],
            volume: 1,
            ease: "Linear",
            duration: duration,

            onStart: function (tween) {
                tween.targets[0].play();
            },
        });
    }
}
