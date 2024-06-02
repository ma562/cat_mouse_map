const myDimension = '10';

document.addEventListener('DOMContentLoaded', () => {
    const selectedCat = localStorage.getItem('cat');
    const selectedMouse = localStorage.getItem('mouse');
    const selectedDimensions = localStorage.getItem('dimensions') || myDimension;

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

            // Set next row/column inward as entrance and exit
            if ((i === 1 && j === 1) || (i === dimensions - 2 && j === dimensions - 2)) {
                cell.classList.add('reserved');
                cell.innerHTML = i === 1 && j === 1 ? '<div class="entrance-exit">Entrance</div>' : '<div class="entrance-exit">Exit</div>';
            }

            cell.addEventListener('click', () => {
                if (!cell.classList.contains('border') && !cell.classList.contains('reserved')) {
                    cell.classList.toggle('wall');
                    updateMapValidity(); // Update validity on click
                }
            });

            mapContainer.appendChild(cell);
        }
    }

    function logSavedMapConfiguration() {
    const mapConfiguration = JSON.parse(localStorage.getItem('mapConfiguration'));

    if (!mapConfiguration) {
        console.log('No map configuration found in local storage.');
        return;
    }

    console.log('Saved Map Configuration:');
    mapConfiguration.forEach(row => {
        console.log(row.join(' '));
    });
    }

    // Call the function to log the map configuration
    


    document.getElementById('start-game').addEventListener('click', () => {
        const mapConfiguration = getMapConfiguration(dimensions);
        
        // Validate the map configuration
        if (isValidConfiguration(mapConfiguration, dimensions)) {
            localStorage.setItem('mapConfiguration', JSON.stringify(mapConfiguration));
            //console.log(localStorage.getItem('mapConfiguration'));
            logSavedMapConfiguration();
            // Redirect to the game page (dummy URL for now)
            window.location.href = 'https://ma562.github.io/joseph_ma_cat_mouse_train/';
        } else {
            alert('Invalid map configuration! Ensure there are no isolated paths and every path is reachable from any other path.');
        }
    });

    document.getElementById('clear-map').addEventListener('click', () => {
        const cells = document.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            if (!cell.classList.contains('border') && !cell.classList.contains('reserved')) {
                cell.classList.remove('wall');
            }
        });
        updateMapValidity(); // Update validity on clear
    });

    // Initial validity check
    updateMapValidity();
});

function getMapConfiguration(dimensions) {
    const mapConfiguration = [];
    const cells = document.querySelectorAll('.map-cell');
    let row = [];
    
    cells.forEach((cell, index) => {
        if (cell.classList.contains('wall')) {
            row.push('-');
        } else if (cell.classList.contains('border')) {
            row.push('-');
        } else if (cell.classList.contains('reserved')) {
            row.push(' ');
        } else {
            row.push(' ');
        }
        
        if ((index + 1) % dimensions === 0) {
            mapConfiguration.push(row);
            row = [];
        }
    });
    return mapConfiguration;
}

function updateMapValidity() {
    const dimensions = parseInt(localStorage.getItem('dimensions') || myDimension);
    const mapConfiguration = getMapConfiguration(dimensions);
    const isValid = isValidConfiguration(mapConfiguration, dimensions);
    const validityDot = document.getElementById('validity-dot');
    if (isValid) {
        validityDot.classList.add('valid');
        validityDot.classList.remove('invalid');
    } else {
        validityDot.classList.add('invalid');
        validityDot.classList.remove('valid');
    }
}

function isValidConfiguration(mapConfiguration, dimensions) {
    class UnionFind {
        constructor(size) {
            this.parent = Array.from({ length: size }, (_, i) => i);
            this.rank = Array(size).fill(0);
        }

        find(x) {
            if (this.parent[x] !== x) {
                this.parent[x] = this.find(this.parent[x]);
            }
            return this.parent[x];
        }

        union(x, y) {
            const rootX = this.find(x);
            const rootY = this.find(y);

            if (rootX !== rootY) {
                if (this.rank[rootX] > this.rank[rootY]) {
                    this.parent[rootY] = rootX;
                } else if (this.rank[rootX] < this.rank[rootY]) {
                    this.parent[rootX] = rootY;
                } else {
                    this.parent[rootY] = rootX;
                    this.rank[rootX] += 1;
                }
            }
        }
    }

    const uf = new UnionFind(dimensions * dimensions);

    const getIndex = (row, col) => row * dimensions + col;

    // Connect adjacent empty cells
    for (let row = 1; row < dimensions - 1; row++) {
        for (let col = 1; col < dimensions - 1; col++) {
            if (mapConfiguration[row][col] === ' ') {
                if (mapConfiguration[row - 1][col] === ' ') {
                    uf.union(getIndex(row, col), getIndex(row - 1, col));
                }
                if (mapConfiguration[row + 1][col] === ' ') {
                    uf.union(getIndex(row, col), getIndex(row + 1, col));
                }
                if (mapConfiguration[row][col - 1] === ' ') {
                    uf.union(getIndex(row, col), getIndex(row, col - 1));
                }
                if (mapConfiguration[row][col + 1] === ' ') {
                    uf.union(getIndex(row, col), getIndex(row, col + 1));
                }
            }
        }
    }

    const entranceIndex = getIndex(1, 1);
    const exitIndex = getIndex(dimensions - 2, dimensions - 2);

    // Check if all empty cells are connected
    const entranceRoot = uf.find(entranceIndex);

    for (let row = 1; row < dimensions - 1; row++) {
        for (let col = 1; col < dimensions - 1; col++) {
            if (mapConfiguration[row][col] === ' ') {
                if (uf.find(getIndex(row, col)) !== entranceRoot) {
                    return false;
                }
            }
        }
    }

    // Ensure entrance and exit are connected
    return uf.find(entranceIndex) === uf.find(exitIndex);
}
