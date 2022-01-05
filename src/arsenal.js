/**
 * @author Yeping Wang
 */

import * as T from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory  } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { XRMarkerModelFactory  } from './XRMarkerModelFactory';
import { XRTongsModelFactory  } from './XRTongsModelFactory';
// import { degToRad, getCurrEEpose, mathjsMatToThreejsVector3 } from './utils';
import { CanvasUI } from './interfaces/WebXRCanvasUI'

export class InputTool {
    constructor(options) {
        this.name = options.name;
        this.model = options.model;
        this.image_url = options.image_url;
        this.relaxedik_config = options.relaxedik_config;
    }
}

export class Arsenal {
    constructor(options) {

        this.controllerGrip = options.controllerGrip;
        this.camera = options.camera;
        this.mouseControl = options.mouseControl;

        this.tools = [];
        this.curr_tool_id = 0;

        const controllerModelFactory = new XRControllerModelFactory();
        let controllerModel = controllerModelFactory.createControllerModel(this.controllerGrip);
        const markerModelFactory = new XRMarkerModelFactory();
        let markerModel = markerModelFactory.createMarkerModel(this.controllerGrip);
        const tongsModelFactory = new XRTongsModelFactory();
        let tongsModel = tongsModelFactory.createTongsModel(this.controllerGrip);

        this.canvas_config = {
            body: { backgroundColor: "#666",
                    opacity: 0.7,
                    padding:0
                },
            panelSize: { width: 0.14, height: 0.035},
            opacity:  1.0,
            width: 1040,
            height: 260,
            highlight: {
                type: "text",
                position:{ left :7.5, top: 7.5 },
                backgroundColor: "#c5050c",
                height: 245,
                width: 245,
                borderRadius: 5
            }
        }
        this.canvas_content = {
            highlight:""
        }

        this.add( new InputTool({
            name: 'controller',
            model: controllerModel,
            image_url: "./images/vive_controller.png",
            relaxedik_config: {
                x: true,
                y: true,
                z: true,
                rx: true,
                ry: true,
                rz: true,
                rel_pos: true,
                rel_rot: true
            }
        }));

        this.add( new InputTool({
            name: 'pen',
            model: markerModel,
            image_url: "./images/marker.png",
            relaxedik_config: {
                x: true,
                y: true,
                z: true,
                rx: true,
                ry: true,
                rz: false,
                rel_pos: true,
                rel_rot: false
            }
        }));

        this.add( new InputTool({
            name: 'tongs',
            model: tongsModel,
            image_url: "./images/tongs.png",
            relaxedik_config: {
                x: true,
                y: true,
                z: true,
                rx: false,
                ry: true,
                rz: true,
                rel_pos: true,
                rel_rot: false
            }
        }));

        this.controllerGrip.add(this.tools[0].model);

        const content = this.canvas_content;
        const config = this.canvas_config;

        window.ui = new CanvasUI(content, config);
        window.ui.mesh.position.set( 0.05, -0.07, -0.2 );
        this.camera.add(window.ui.mesh);

        const text_config = {
            body: { backgroundColor: "#666",
                    opacity: 1.0,
                    padding: 20,
                    fontColor: '#000',
                    borderRadius: 5
                },
            panelSize: { width: 0.03, height: 0.035},
            opacity:  1.0,
            width: 300,
            height: 350,
            padding: 20
        };
        const text_content = {
            body: "Trigger: Clutch\
                    Gamepad left/right: Switch tools\
                    Gamepad up: Re-ground\
                    Gamepad down: Next round"
        };
        const text_ui = new CanvasUI(text_content, text_config);
        text_ui.mesh.position.set( -0.04, -0.07, -0.2 );
        this.camera.add(text_ui.mesh);
    }

    add(tool) {
        this.tools.push(tool);
        this.canvas_config["image_" + tool.name] =
            {   type: "img",
                position: {
                    left: 15 + (this.tools.length-1) * (230 + 30),
                    top: 15 },
                width: 230,
                borderRadius: 5  };
        this.canvas_content["image_" + tool.name] = tool.image_url;
    }

    next_tool() {
        this.curr_tool_id += 1;
        if (this.curr_tool_id == this.tools.length)
            this.curr_tool_id = 0;
        this.change_tool();
    }

    prev_tool() {
        this.curr_tool_id -= 1;
        if (this.curr_tool_id == -1)
            this.curr_tool_id = this.tools.length - 1;
        this.change_tool();
    }

    change_tool() {
        if (this.curr_tool_id == 1) {
            window.mouseControl.rel_rot = false;
            window.vrControl.rel_rot = false;
        } else {
            window.mouseControl.rel_rot = true;
            window.vrControl.rel_rot = true;
        }
        
        for (let i=0; i<this.tools.length; i++) {
            if (i==this.curr_tool_id)
                this.controllerGrip.add(this.tools[i].model);
            else
                this.controllerGrip.remove(this.tools[i].model);
        }

        window.ui.updateConfig('highlight', 'position', 
            { left :7.5 + this.curr_tool_id * 260, top: 7.5, 
                x:  7.5 + this.curr_tool_id * 260, y: 7.5 });
        window.ui.update();

        window.vrControl.squeeze();
    }

    robot_reset() {
        this.mouseControl.reset();
    }

    onControllerMove(x, z, y, r) {
        this.mouseControl.onControllerMove(x, z, y, r);
    }
}

