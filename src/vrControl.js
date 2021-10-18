/**
 * @author William Cong 
 */

import * as T from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { degToRad, getCurrEEpose, mathjsMatToThreejsVector3 } from './utils';


export class VrControl {
    constructor(options) {

        this.relaxedIK = options.relaxedIK
        this.renderer = options.renderer
        this.scene = options.scene
        this.intervalID = undefined;
        this.mouseControl = options.mouseControl
        this.controlMapping = options.controlMapping;
        this.test = 1

        this.controller1 = this.renderer.xr.getController(0); 
        this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
        const controllerModelFactory = new XRControllerModelFactory()
        this.model1 = controllerModelFactory.createControllerModel(this.controllerGrip1);
        this.controllerGrip1.add(this.model1);

        this.scene.add( this.controllerGrip1 );

        this.squeezeStart = this.squeezeStart.bind(this);
        this.squeezeEnd = this.squeezeEnd.bind(this);
        this.selectStart = this.selectStart.bind(this);
        this.selectEnd = this.selectEnd.bind(this);

        this.controller1.addEventListener('squeezestart', this.squeezeStart.bind(this));
        this.controller1.addEventListener('squeezeend', this.squeezeEnd.bind(this));
        this.controller1.addEventListener('selectstart', this.selectStart.bind(this));
        this.controller1.addEventListener('selectend', this.selectEnd.bind(this));
        
    }

    selectStart() {
        clearInterval(this.intervalID);
        let controllerPos = this.controller1.getWorldPosition(new T.Vector3(0, 0, 0))
        let prevX = controllerPos.x * 5000
        let prevY = controllerPos.z * 5000

        this.intervalID = setInterval(() => {
            controllerPos = this.controller1.getWorldPosition(new T.Vector3(0, 0, 0))
            let currX = controllerPos.x * 5000
            let currY = controllerPos.z * 5000

            let x = currX - prevX
            let y = currY - prevY

            this.mouseControl.onControllerRotate(y, x)
            
            prevX = currX
            prevY = currY
        }, 5);
    }

    selectEnd() {
        clearInterval(this.intervalID);
    }

    squeezeStart() {
        clearInterval(this.intervalID);
        let controllerPos = this.controller1.getWorldPosition(new T.Vector3(0, 0, 0))
        let controllerRot = this.controller1.getWorldQuaternion(new T.Quaternion())

        let scaleFactor = 5000
        let prev = {
            x: controllerPos.x * scaleFactor,
            y: controllerPos.y * (scaleFactor/100),
            z: controllerPos.z * scaleFactor,
            r: controllerRot
        } 

        this.intervalID = setInterval(() => {
            controllerPos = this.controller1.getWorldPosition(new T.Vector3(0, 0, 0))
            controllerRot = this.controller1.getWorldQuaternion(new T.Quaternion())
            
            let curr = {
                x: controllerPos.x * scaleFactor,
                y: controllerPos.y * (scaleFactor/100),
                z: controllerPos.z * scaleFactor,
                r: controllerRot
            }

            let x = curr.x - prev.x
            let y = curr.y - prev.y
            let z = curr.z - prev.z
            let r = curr.r.multiply(prev.r.invert())

            this.mouseControl.onControllerMove(x, z, y, r)
            
            prev = curr
        }, 5); 
    }

    squeezeEnd() {
        clearInterval(this.intervalID);
    }
}

