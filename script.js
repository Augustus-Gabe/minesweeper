// Minesweeper

/**
 * REGRAS DE NEGOCIO
 * ========================================================================
 * 1 - Grid de tamanho variável
 * 2 - Cada célula da grid pode conter: nada (vazio), um número ou uma mina
 * 3 - O estado da célula permanece oculto até ser clicado
 * 4 - Ao clicar numa célula vazia, as células ao redor que não contém minas são liberadas
 * 5 - ao clicar numa célula com número, o número exibido é igual ao de minas adjacentes à célula
 * 6 - ao clicar em uma célulaa com mina, todas as células são reveladas e o jogo encerra com GAME OVER
 * 7 - TODO: é possível marcar uma célula em que se acredita haver uma mina, usando clique direito do mouse
 * 8 - Ganha-se o jogo ao liberar todos os espaços que não contém minas
 */

 let GAME_BOARD,
    BOARD_SIZE = 20,
    CELL_WIDTH = 20,
    TOTAL_MINES = 0,
    CELLS_REMAINING = Math.pow(BOARD_SIZE, 2),
    GAME_OVER = false,
    GAME_WON = false;

const MINE_DENSITY = 0.89;

let HTMLWrapper;

class Cell {
    constructor(i, j, w) {
        this.i = i;
        this.j = j;
        this.w = w;
        this.mine = false;
        this.reveal = false;
        this.nearMines = 0;
    }
}

const drawBoard = (size) => {
    GAME_BOARD = new Array(size);
    for (let idx = 0; idx < GAME_BOARD.length; idx++) {
        GAME_BOARD[idx] = new Array(size);
        
    }
};
    
const iterateAllCells = (callbackfn) => {
    for (let i = 0; i < GAME_BOARD.length; i++) {
        for (let j = 0; j < GAME_BOARD.length; j++) {
            callbackfn(i, j);
        }
    }
};

const placeMines = (density) => {
    iterateAllCells((i, j) => {
        GAME_BOARD[i][j] = new Cell(i, j, CELL_WIDTH);
        if ((Math.random(1) > density)) {
            GAME_BOARD[i][j].mine = true;
            TOTAL_MINES++;
        }
    });
    iterateAllCells((i, j) => {
        countNearMines(GAME_BOARD[i][j]);
    })
};

const countNearMines = (cell) => {
    if(cell.mine) return -1;

    iterateNeighborhood(cell, (neighbor) => {
        if(neighbor.mine) cell.nearMines++;
    });
};

const iterateNeighborhood = (cell, callbackfn) => {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const x_offset = cell.i + i;
            const y_offset = cell.j + j;

            if (x_offset > -1 && x_offset < BOARD_SIZE && y_offset > -1 && y_offset < BOARD_SIZE) {
                const neighbor = GAME_BOARD[x_offset][y_offset];
                callbackfn(neighbor);
            }
        }
    }
}

const revealSingle = (cell) => {
    const {i, j} = getCellPos(cell);

    if(GAME_BOARD[i][j].reveal) return;

    GAME_BOARD[i][j].reveal = true;
    cell.className = 'cell reveal';
    CELLS_REMAINING--;

    if (!GAME_BOARD[i][j].mine && GAME_BOARD[i][j].nearMines === 0) {
        revealNearBlanks(GAME_BOARD[i][j]);
    }

    checkGameStatus(GAME_BOARD[i][j]);
}

const getCellPos = (cell) => {
    const i = cell.dataset.x || cell.getAttribute('data-x');
    const j = cell.dataset.y || cell.getAttribute('data-y');
    return {i, j};
}

const revealNearBlanks = (cell) => {
    iterateNeighborhood(cell, (neighbor) => {
        if (!(neighbor.mine || neighbor.reveal)) {
            const DOMNode = document.querySelector(`[data-x='${neighbor.i}'][data-y='${neighbor.j}']`);
            revealSingle(DOMNode);
        }
    });
}

const checkGameStatus = (cell) => {
    (!GAME_OVER) && isGameOver(cell) && console.log("YOU LOST");
    (!GAME_WON) && isGameWon() && console.log("YOU WON");
}

const isGameOver = (cell) => {
    if(!(cell.mine && cell.reveal)) return false;
    GAME_OVER = true;
    revealAll();
    return GAME_OVER;
}

const isGameWon = () => {
    if (GAME_OVER || TOTAL_MINES !== CELLS_REMAINING) return false;
    GAME_WON = true;
    revealAll();
    return GAME_WON;
}

const revealAll = () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        revealSingle(cell);
    });
}


// INITIALIZE GAME
drawBoard(BOARD_SIZE);
placeMines(MINE_DENSITY);

window.addEventListener('DOMContentLoaded', () => {
    placeGridToDOM();
    iterateAllCells((i,j) => {
        placeCellsToDOM(GAME_BOARD[i][j])
    });

    document.addEventListener('click', (e) => {
        if(e.target.className.includes('cell')) {
            revealSingle(e.target);
        }
    });
});

const placeGridToDOM = () => {
    HTMLWrapper = document.getElementById('wrapper');
    HTMLWrapper.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${CELL_WIDTH}, ${CELL_WIDTH}px);
        grid-template-rows: repeat(${CELL_WIDTH}, ${CELL_WIDTH}px);
        height:500px;
    `;
};

const placeCellsToDOM = (cell) => {
    const div = document.createElement('div');
    div.className = 'cell';
    div.setAttribute('data-x', cell.i);
    div.setAttribute('data-y', cell.j);
    div.style.cssText = `
        width: ${cell.w};
        height: ${cell.w};
        border: 1px solid #000;
        text-align: center;
        box-sizing:border-box
    `;
    const span = document.createElement('span');
    span.className = 'no-reveal';
    let text;

    if(!cell.mine){
        text = cell.nearMines || '';
    } else {
        text = `💣`;
    }

    const textNode = document.createTextNode(text);
    span.appendChild(textNode);
    div.appendChild(span);
    HTMLWrapper.appendChild(div);
}


