import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ViewerConfig {
    models: string[];
    colors: string[];
}

export class ViewerModule {
    private container: HTMLDivElement;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private loader: GLTFLoader;
    private currentModel: THREE.Group | null = null;
    private mixer: THREE.AnimationMixer | null = null;
    private clock: THREE.Clock;
    private animationSelect: HTMLSelectElement;
    private animations: THREE.AnimationClip[] = [];

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.loader = new GLTFLoader();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        this.camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(5, 5, 5).normalize();
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(0, 10, 10);
        this.scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0xffffff, 1);
        pointLight2.position.set(0, -10, -10);
        this.scene.add(pointLight2);

        this.clock = new THREE.Clock();
        this.animationSelect = document.getElementById('animationSelect') as HTMLSelectElement;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    start(config: ViewerConfig) {
        console.log("Starting viewer with config:", config);
        this.loadModel(config.models[0]);
        this.animate();
    }

    loadModel(url: string) {
        console.log("Loading model from URL:", url);
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            if (this.mixer) {
                this.mixer.stopAllAction();
                this.mixer = null;
            }
        }
        this.loader.load(url, (gltf: GLTF) => {
            console.log("Model loaded successfully:", gltf);
            this.currentModel = gltf.scene;
            this.scene.add(gltf.scene);

            this.animations = gltf.animations;
            this.animationSelect.innerHTML = '';
            if (this.animations.length) {
                this.mixer = new THREE.AnimationMixer(gltf.scene);
                this.animations.forEach((clip) => {
                    const option = document.createElement('option');
                    option.value = clip.name;
                    option.text = clip.name;
                    this.animationSelect.appendChild(option);
                    this.mixer!.clipAction(clip).play();
                });
            }

            const box = new THREE.Box3().setFromObject(gltf.scene);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            this.camera.position.set(center.x, center.y, size * 1.5);
            this.camera.lookAt(center);
            this.controls.update();
        }, undefined, (error) => {
            console.error("Error loading model:", error);
        });
    }

    setColor(color: string) {
        console.log("Setting color to:", color);
        if (this.currentModel) {
            this.currentModel.traverse((child: THREE.Object3D) => {
                if ((child as THREE.Mesh).isMesh) {
                    ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color.set(color);
                }
            });
        }
    }

    playAnimation(name: string) {
        console.log("Playing animation:", name);
        if (this.mixer && this.currentModel) {
            this.mixer.stopAllAction();
            const clip = this.animations.find(clip => clip.name === name);
            if (clip) {
                const action = this.mixer.clipAction(clip);
                if (action) {
                    action.play();
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        if (this.mixer) {
            this.mixer.update(delta);
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        this.renderer.dispose();
    }
}
