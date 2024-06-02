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

            // Set next row/column inward as entrance and exit
            if ((i === 1 && j === 1) || (i === dimensions - 2 && j === dimensions - 2)) {
                cell.classList.add('reserved');
                cell.innerHTML = i === 1 && j === 1 ? '<div class="entrance-exit">Entrance</div>' : '<div class="entrance-exit">Exit</div>';
            }

            cell.addEventListener('click', () => {
                if (!cell.classList.contains('border') && !cell.classList.contains('reserved')) {
                    cell.classList.toggle('wall');
                }
            });

            mapContainer.appendChild(cell);
        }
    }

    document.getElementById('start-game').addEventListener('click', () => {
        const mapConfiguration = [];
        const cells = document.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            if (cell.classList.contains('wall')) {
                mapConfiguration.push('wall');
            } else {
                mapConfiguration.push('empty');
            }
        });

        // Validate the map configuration
        if (isValidConfiguration(mapConfiguration, dimensions)) {
            localStorage.setItem('mapConfiguration', JSON.stringify(mapConfiguration));
            // Redirect to the game page (dummy URL for now)
            //window.location.href = 'https://example.com/game';
            alert("valid game");
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
    });
});

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
            if (mapConfiguration[getIndex(row, col)] === 'empty') {
                if (mapConfiguration[getIndex(row - 1, col)] === 'empty') {
                    uf.union(getIndex(row, col), getIndex(row - 1, col));
                }
                if (mapConfiguration[getIndex(row + 1, col)] === 'empty') {
                    uf.union(getIndex(row, col), getIndex(row + 1, col));
                }
                if (mapConfiguration[getIndex(row, col - 1)] === 'empty') {
                    uf.union(getIndex(row, col), getIndex(row, col - 1));
                }
                if (mapConfiguration[getIndex(row, col + 1)] === 'empty') {
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
            if (mapConfiguration[getIndex(row, col)] === 'empty') {
                if (uf.find(getIndex(row, col)) !== entranceRoot) {
                    return false;
                }
            }
        }
    }

    // Ensure entrance and exit are connected
    return uf.find(entranceIndex) === uf.find(exitIndex);
}
