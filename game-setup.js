//game-setup.js
document.addEventListener('DOMContentLoaded', () => {
    const selectedCat = localStorage.getItem('cat');
    const selectedMouse = localStorage.getItem('mouse');
    const selectedDimensions = localStorage.getItem('dimensions') || '15';

    document.getElementById('selected-cat').textContent = selectedCat;
    document.getElementById('selected-mouse').textContent = selectedMouse;
    document.getElementById('selected-dimensions').textContent = `${selectedDimensions} x ${selectedDimensions}`;

    const mapContainer = document.getElementById('map-container');
    const dimensions = parseInt(selectedDimensions);

    // Set the grid template columns to match the selected dimensions
    mapContainer.style.gridTemplateColumns = `repeat(${dimensions}, 1fr)`;

    // Create the grid
    for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
            const cell = document.createElement('div');
            cell.classList.add('map-cell');
            
            // Set borders as non-clickable walls
            if (i === 0 || i === dimensions - 1 || j === 0 || j === dimensions - 1) {
                cell.classList.add('border');
            }
            
            cell.addEventListener('click', () => {
                if (!cell.classList.contains('border')) {
                    cell.classList.toggle('wall');
                }
            });

            mapContainer.appendChild(cell);
        }
    }

    document.getElementById('start-game').addEventListener('click', () => {
        // Save the map configuration to local storage
        const mapConfiguration = [];
        const cells = document.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            if (cell.classList.contains('wall')) {
                mapConfiguration.push('wall');
            } else {
                mapConfiguration.push('empty');
            }
        });
        localStorage.setItem('mapConfiguration', JSON.stringify(mapConfiguration));
        // Redirect to the game page (dummy URL for now)
        window.location.href = 'https://example.com/game';
    });

    document.getElementById('clear-map').addEventListener('click', () => {
        const cells = document.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            if (!cell.classList.contains('border')) {
                cell.classList.remove('wall');
            }
        });
    });
});
