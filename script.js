window.onload = () => {
    const baseGroup = document.getElementById('baseGroup');
    const scene = document.querySelector('a-scene');
    const statusText = document.getElementById('statusText');
    const contenedorAmarillo = document.getElementById('contenedorAmarillo');
    const valorTotalText = document.getElementById('valorTotal');
    const resetBtn = document.getElementById('resetBtn');

    const totalGroups = 10;
    const minPerGroup = 5;
    const maxPerGroup = 20;
    const itemSpacing = 5;
    const groupArea = 1000; //5000

    let containerOffsetY = 0.3;
    const maxAllowedInside = 20;
    const hiddenGroups = new Set();
    let isProcessingClick = false;

    // Nuevas variables para el conteo de centollas
    let totalPiezas = 0;
    let totalKilos = 0;

    // Función para crear un cubo de pesca con datos de centolla
    function createFishingCube() {
        const cube = document.createElement('a-box');
        cube.setAttribute('color', '#4287f5');
        cube.setAttribute('width', '0.5');
        cube.setAttribute('height', '0.5');
        cube.setAttribute('depth', '0.5');

        // Calcular la posición en una cuadrícula 3D dentro del contenedor
        const currentCubes = contenedorAmarillo.querySelectorAll('.fishing-cube').length;
        const gridSize = 4; // 4x4 grid en cada nivel
        const level = Math.floor(currentCubes / (gridSize * gridSize));
        const remainingCubes = currentCubes % (gridSize * gridSize);
        const row = Math.floor(remainingCubes / gridSize);
        const col = remainingCubes % gridSize;

        // Calcular las coordenadas dentro del contenedor amarillo
        const xOffset = (col - (gridSize - 1) / 2) * 0.6;
        const yOffset = level * 0.6 + 0.3;
        const zOffset = (row - (gridSize - 1) / 2) * 0.6;

        cube.setAttribute('position', `${xOffset} ${yOffset} ${zOffset}`);
        cube.setAttribute('class', 'fishing-cube');
        
        // Datos de centolla
        const numCentollas = Math.floor(Math.random() * 81);
        const pesoPromedio = (Math.random() * 2 + 1).toFixed(2);
        const pesoTotal = (numCentollas * pesoPromedio).toFixed(2);
        
        cube.setAttribute('data-centollas', numCentollas);
        cube.setAttribute('data-peso', pesoTotal);
        
        return cube;
    }

    function updateTotalDisplay() {
        valorTotalText.setAttribute('value', `Total: ${totalPiezas} centollas - ${totalKilos.toFixed(2)} kg`);
    }

    function handleSphereClick(event) {
        if (isProcessingClick) return;
        isProcessingClick = true;
        
        setTimeout(() => {
            isProcessingClick = false;
        }, 300);
        
        const currentCubes = contenedorAmarillo.querySelectorAll('.fishing-cube').length;
        
        if (currentCubes >= maxAllowedInside) {
            statusText.setAttribute('value', 'Contenedor lleno! Máximo 20 peces');
            return;
        }

        const groupEntity = event.target.parentElement;
        const groupId = groupEntity.id;
        
        if (hiddenGroups.has(groupId)) return;
        
        groupEntity.setAttribute('visible', false);
        hiddenGroups.add(groupId);
        
        const fishingCube = createFishingCube();
        contenedorAmarillo.appendChild(fishingCube);
        
        const numCentollas = parseInt(fishingCube.getAttribute('data-centollas'));
        const peso = parseFloat(fishingCube.getAttribute('data-peso'));
        
        totalPiezas += numCentollas;
        totalKilos += peso;
        
        updateTotalDisplay();
        statusText.setAttribute('value', 
            `Captura: ${numCentollas} centollas - ${peso} kg (${currentCubes + 1}/20)`);
    }

    let isProcessingContainerClick = false;

    contenedorAmarillo.addEventListener('click', () => {
        if (isProcessingContainerClick) return;
        isProcessingContainerClick = true;
        
        setTimeout(() => {
            isProcessingContainerClick = false;
        }, 300);

        const fishingCubes = contenedorAmarillo.querySelectorAll('.fishing-cube');
        if (fishingCubes.length > 0) {
            const lastCube = fishingCubes[fishingCubes.length - 1];
            
            const numCentollas = parseInt(lastCube.getAttribute('data-centollas'));
            const peso = parseFloat(lastCube.getAttribute('data-peso'));
            
            lastCube.parentNode.removeChild(lastCube);
            
            if (hiddenGroups.size > 0) {
                const groupId = Array.from(hiddenGroups)[0];
                const group = document.getElementById(groupId);
                if (group) {
                    group.setAttribute('visible', true);
                    hiddenGroups.delete(groupId);
                }
            }
            
            const remainingCubes = fishingCubes.length - 1;
            statusText.setAttribute('value', 
                `Liberado: ${numCentollas} centollas - ${peso} kg (${remainingCubes}/20)`);
        }
    });

    resetBtn.addEventListener('click', () => {
        if (isProcessingClick) return;
        isProcessingClick = true;
        
        setTimeout(() => {
            isProcessingClick = false;
        }, 300);

        containerOffsetY = 0.3;
        hiddenGroups.clear();
        totalPiezas = 0;
        totalKilos = 0;
        updateTotalDisplay();
        
        const fishingCubes = contenedorAmarillo.querySelectorAll('.fishing-cube');
        fishingCubes.forEach(cube => cube.parentNode.removeChild(cube));
        const groups = scene.querySelectorAll('a-entity');
        groups.forEach(group => group.setAttribute('visible', true));
        statusText.setAttribute('value', `Contador reseteado`);
    });

    for (let g = 0; g < totalGroups; g++) {
        const itemsInGroup = Math.floor(Math.random() * (maxPerGroup - minPerGroup + 1)) + minPerGroup;

        const groupCenterX = (Math.random() - 0.5) * groupArea;
        const groupCenterZ = -3 + (Math.random() - 0.5) * groupArea;

        for (let i = 0; i < itemsInGroup; i++) {
            const groupId = `group${g}_item${i}`;
            const groupClone = document.createElement('a-entity');
            groupClone.setAttribute('id', groupId);
            groupClone.setAttribute('visible', true);

            const sphere = document.createElement('a-sphere');
            sphere.setAttribute('color', 'red');
            sphere.setAttribute('radius', '0.25');
            sphere.setAttribute('position', '0 0 0');
            sphere.setAttribute('class', 'clickable');
            sphere.addEventListener('click', handleSphereClick);
            
            const box = document.createElement('a-box');
            box.setAttribute('color', 'blue');
            box.setAttribute('depth', '1');
            box.setAttribute('height', '1');
            box.setAttribute('width', '1');
            box.setAttribute('position', '0 -50 0');

            groupClone.appendChild(box);
            groupClone.appendChild(sphere);

            const cols = Math.ceil(Math.sqrt(itemsInGroup));
            const row = Math.floor(i / cols);
            const col = i % cols;
            const localOffsetX = (col - cols / 2) * itemSpacing;
            const localOffsetZ = (row - cols / 2) * itemSpacing;

            const posX = groupCenterX + localOffsetX;
            const posZ = groupCenterZ + localOffsetZ;

            groupClone.setAttribute('position', `${posX} 0 ${posZ}`);
            scene.appendChild(groupClone);
        }
    }
};
