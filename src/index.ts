import { ViewerModule } from './ViewerModule';

const container = document.getElementById('container') as HTMLDivElement;
const viewer = new ViewerModule(container);

const modelSelect = document.getElementById('modelSelect') as HTMLSelectElement;
const colorPicker = document.getElementById('colorPicker') as HTMLInputElement;
const animationSelect = document.getElementById('animationSelect') as HTMLSelectElement;

viewer.start({
    models: [
        'models/Chair.glb',
        'models/GeoPlanter.glb',
        'models/Mixer.glb',
        'models/RobotExpressive.glb'
    ],
    colors: ['#ff0000', '#00ff00', '#0000ff']
});

modelSelect.addEventListener('change', (event) => {
    viewer.loadModel((event.target as HTMLSelectElement).value);
});

colorPicker.addEventListener('input', (event) => {
    viewer.setColor((event.target as HTMLInputElement).value);
});

animationSelect.addEventListener('change', (event) => {
    viewer.playAnimation((event.target as HTMLSelectElement).value);
});
