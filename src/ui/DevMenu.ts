import Phaser from "phaser";

export class DevMenu{
    private panel: Phaser.GameObjects.Container;

    constructor(scene:Phaser.Scene, onSelectLevel: (level:number) => void){
        //dark panel background
        const background = scene.add.rectangle(0,0,360,220,0x172c45);
        background.setStrokeStyle(3,0x00ccff);

        //menu heading
        const title = scene.add.text(0,-75,"DEVELOPER MENU",{fontSize:"24px",color:"#ffffff"});
        title.setOrigin(0.5);

        //level buttons
        const levelButtons: Phaser.GameObjects.Text[] = [];

        for(let level =1; level <= 5; level++){
            const y = -40 + (level-1) * 31;

            const button = scene.add.text(0,y,  `LEVEL ${level}`,{ fontSize: "18px",color: "#ffffff",backgroundColor: "#225580",padding: { x: 18, y: 5 }});
            button.setOrigin(0.5);
            button.setInteractive({useHandCursor:true});

            button.on("pointerdown",(
                _pointer:Phaser.Input.Pointer,
                _localX:number,
                _localY:number,
                event:Phaser.Types.Input.EventData)=>{
                    event.stopPropagation();
                    onSelectLevel(level);
                });

                levelButtons.push(button)
        }

        //put background and title together
        this.panel = scene.add.container(scene.scale.width/2,scene.scale.height/2,[background,title, ...levelButtons]);

        this.panel.setDepth(100);
        this.panel.setVisible(false);
    }
    public toggle(): void{
        this.panel.setVisible(!this.panel.visible);
    }
}