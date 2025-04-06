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
    const groupArea = 500;

    let containerOffsetY = 0.3;
    let movedCount = 0;
    const maxAllowedInside = 10;

    const movedGroups = new Set();
    const originalPositions = {};
    let totalValue = 0;

    for (let g = 0; g < totalGroups; g++) {
        const itemsInGroup = Math.floor(Math.random() * (maxPerGroup - minPerGroup + 1)) + minPerGroup;

        const groupCenterX = (Math.random() - 0.5) * groupArea;
        const groupCenterZ = -3 + (Math.random() - 0.5) * groupArea;

        for (let i = 0; i < itemsInGroup; i++) {
            const groupId = `group${g}_item${i}`;
            const groupClone = document.createElement('a-entity');
            groupClone.setAttribute('id', groupId);
            groupClone.setAttribute('visible', true);

            const value = Math.floor(Math.random() * 29) + 5; // valor aleatorio 5–30
            groupClone.dataset.valor = value;

            baseGroup.childNodes.forEach(child => {
                if (child.tagName) {
                    const elementClone = child.cloneNode();
                    if (elementClone.getAttribute('geometry')?.primitive === 'box') {
                        elementClone.setAttribute('position', `0 -50 0`);
                    } else if (elementClone.getAttribute('geometry')?.primitive === 'sphere') {
                        elementClone.setAttribute('position', `0 0 0`);
                    }
                    groupClone.appendChild(elementClone);
                }
            });

            const cols = Math.ceil(Math.sqrt(itemsInGroup));
            const row = Math.floor(i / cols);
            const col = i % cols;
            const localOffsetX = (col - cols / 2) * itemSpacing;
            const localOffsetZ = (row - cols / 2) * itemSpacing;

            const posX = groupCenterX + localOffsetX;
            const posZ = groupCenterZ + localOffsetZ;

            const initialPos = { x: posX, y: 0, z: posZ };
            originalPositions[groupId] = initialPos;

            groupClone.setAttribute('position', `${posX} 0 ${posZ}`);

            groupClone.addEventListener('click', () => {
                if (movedCount >= maxAllowedInside || movedGroups.has(groupId)) {
                    return;
                }

                // ✅ Mover dentro del contenedor y fijar posición relativa
                contenedorAmarillo.appendChild(groupClone);
                groupClone.setAttribute('position', `0 ${containerOffsetY} 0`);

                containerOffsetY += 0;
                movedCount++;
                movedGroups.add(groupId);

                groupClone.childNodes.forEach(child => {
                    if (child.tagName) {
                        if (child.getAttribute('geometry')?.primitive === 'box') {
                            child.setAttribute('position', `0 0 0`);
                        } else if (child.getAttribute('geometry')?.primitive === 'sphere') {
                            child.setAttribute('position', `0 -0.6 0`);
                        }
                    }
                });

                const val = parseInt(groupClone.dataset.valor || "0");
                totalValue += val;
                valorTotalText.setAttribute('value', `Total: ${totalValue}`);

                statusText.setAttribute('value', `Grupo ${g}, Item ${i} movido (${movedCount}/${maxAllowedInside})`);
            });

            scene.appendChild(groupClone);
        }
    }

    contenedorAmarillo.addEventListener('click', () => {
        movedGroups.forEach(groupId => {
            const groupEntity = document.getElementById(groupId);
            if (groupEntity && originalPositions[groupId]) {
                const pos = originalPositions[groupId];
                scene.appendChild(groupEntity); // ✅ Regresar a escena
                groupEntity.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);

                groupEntity.childNodes.forEach(child => {
                    if (child.tagName) {
                        if (child.getAttribute('geometry')?.primitive === 'box') {
                            child.setAttribute('position', `0 -50 0`);
                        } else if (child.getAttribute('geometry')?.primitive === 'sphere') {
                            child.setAttribute('position', `0 0 0`);
                        }
                    }
                });
            }
        });

        movedGroups.clear();
        containerOffsetY = 0.3;
        movedCount = 0;
        statusText.setAttribute('value', `Cubos azules regresaron a su lugar (Total sigue igual)`);
    });

    resetBtn.addEventListener('click', () => {
        totalValue = 0;
        valorTotalText.setAttribute('value', `Total: 0`);
        statusText.setAttribute('value', `Contador reseteado`);
    });
};
