
const deployerAddress = "0xE455ADC37b5447629aF36847200472fCf553415E"

import { DEPLOYER_ABI, BATTLESHIP_ABI } from './abis.js';

let signer;
let player;
let otherPlayer;

let addressP1;
let addressP2;
let shipSizes;
let boardDim;
let gameContractAddress;
let startingPlayer;
let currentTurn;
let gameWager;

let gameState;

let placements = [];

let provider;


// Set EventListener
const commitBtn = document.getElementById("commitBtn");
commitBtn.addEventListener("click", () => {
    commitFleet();
});

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener("click", () => {
    resetShips();
});

const depositBtn = document.getElementById("depositBtn");
depositBtn.addEventListener("click", () => {
    makeDeposit();
});

const joinQueueBtn = document.getElementById("joinQueueBtn");
joinQueueBtn.addEventListener("click", () => {
    joinQueue();
});

const leaveQueueBtn = document.getElementById("leaveQueueBtn");
leaveQueueBtn.addEventListener("click", () => {
    leaveQueue();
});

const resetGameBtn = document.getElementById("resetGameBtn");
resetGameBtn.addEventListener("click", () => {
    sendResetGame();
});


function updateGameState(newState) {
    gameState = newState
}

async function sendResetGame() {
    const gameContract = new ethers.Contract(gameContractAddress, BATTLESHIP_ABI, signer);
    const tx = await gameContract.reset();
    const receipt = await tx.wait();
    if (receipt.status === 1) {
        console.log("valid reset tx")
    }
}

function resetGame() {
    gameState = "";
    placements = [];

    document.getElementById("leaveQueueBtn").style.visibility = "hidden";
    const depositBtn = document.getElementById("depositBtn");
    depositBtn.style.visibility = "hidden";
    document.getElementById("resetBtn").style.visibility = "hidden";

    document.getElementById("gameBoardOwn").style.visibility = "hidden";
    document.getElementById("gameBoardOpp").style.visibility = "hidden";

    document.getElementById("player1Deposited").innerText = "No";
    document.getElementById("player2Deposited").innerText = "No";

    document.getElementById("ship-dock-container").style.display = "block";

    depositBtn.innerText = "Make Deposit";
    depositBtn.style.backgroundColor = "";



    initGame(addressP1, addressP2, startingPlayer, boardDim, shipSizes, gameWager, gameContractAddress);
    displayGameState();
}

async function leaveQueue() {
    const deployerContract = new ethers.Contract(deployerAddress, DEPLOYER_ABI, signer);
    const tx = await deployerContract.requestRemoval();
    const receipt = await tx.wait();
    if (receipt.status === 1) {
        alert("Left Queue");
        const leaveQueueBtn = document.getElementById("leaveQueueBtn");
        leaveQueueBtn.style.visibility = "hidden";
        const joinQueueBtn = document.getElementById("joinQueueBtn");
        joinQueueBtn.style.visibility = "visible";
    }
}

async function joinQueue() {
    const deployerContract = new ethers.Contract(deployerAddress, DEPLOYER_ABI, signer);
    const tx = await deployerContract.makeSimpleRequest();
    const receipt = await tx.wait();
    if (receipt.status === 1) {
        alert("Joined Queue");
        const leaveQueueBtn = document.getElementById("leaveQueueBtn");
        leaveQueueBtn.style.visibility = "visible";
        const joinQueueBtn = document.getElementById("joinQueueBtn");
        joinQueueBtn.style.visibility = "hidden";
    }
}

async function makeDeposit() {
    const depositBtn = document.getElementById("depositBtn");
    const gameContract = new ethers.Contract(gameContractAddress, BATTLESHIP_ABI, signer);
    const tx = await gameContract.deposit({
        value: gameWager
    });
    const receipt = await tx.wait();
    if (receipt.status === 1) {
        depositBtn.innerText = "Deposit Successful!";
        depositBtn.style.backgroundColor = "#27ae60";
    }

}

function displayPlayerTurn() {
    const state = document.getElementById("gameState");
    state.innerText = currentTurn === addressP1 ? "Turn of Player1" : "Turn of Player2";
}

function displayGameState() {
    const state = document.getElementById("gameState");
    const dock = document.getElementById("ship-dock-container");
    if(gameState === "placementStarted") {
        state.innerText = "Place your Fleet";
        dock.style.visibility = "visible";
    }
}

function setTurn(address, hit, sunk) {
    if (!hit) {
        currentTurn = address === addressP1 ? addressP2 : addressP1;
    }
    displayPlayerTurn();
}

function displayShot(address, x, y, hit, sunk) {
    if(player === address) { // It was the PLayers turn
        const cellId = `opp-cell-${y}-${x}`;
        const targetCell = document.getElementById(cellId);

        if(hit) {
            targetCell.classList.add("hit");
        } else {
            targetCell.classList.add("miss");
        }
        if(sunk) {
            alert("Ship sunken");
        }
    } else if(address === otherPlayer) {
        const cellId = `cell-${y}-${x}`;
        const targetCell = document.getElementById(cellId);
        if(hit) {
            targetCell.classList.add("hit");
        } else {
            targetCell.classList.add("miss");
        }
    }
}

function setDeposit(player) {
    if(player === addressP1) {
        const player1Deposited = document.getElementById("player1Deposited")
        player1Deposited.innerText = "Deposit Made"
    }else if(player === addressP2) {
        const player2Deposited = document.getElementById("player2Deposited")
        player2Deposited.innerText = "Deposit Made"
    }
}

function onPayout(winner, amount) {
    if(player === winner) {
        alert(`You won: ${amount}`)
    } else {
        alert(`You've lost`)
    }
    const resetGameBtn = document.getElementById("resetGameBtn");
    resetGameBtn.style.visibility = "visible";
}


async function setupGameListener(contractAddress) {

    const contract = new ethers.Contract(contractAddress, BATTLESHIP_ABI, provider);

    contract.on("Deposit_Made", (payee, amount) => {
        console.log(`Deposit of: ${amount} made by: ${payee}`)
        setDeposit(payee);
    });

    contract.on("Game_Start", () => {
        console.log("Game Started");
        updateGameState("gameStarted")
        displayPlayerTurn();
    });

    contract.on("Placements_Start", () => {
        console.log("Placement Phase started")
        updateGameState("placementStarted");
        displayGameState();
    });

    contract.on("Placement", (player) => {
        console.log(`Placement made by: ${player}`)
    });

    contract.on("Default", (winnerByDefault) => {
       console.log(`Default winner set to: ${winnerByDefault}`)
    });

    contract.on("Reset", () => {
        console.log("Reset Contract!")
        resetGame();
    });

    contract.on("ShotFired", (address, x, y, hit, sunk) => {
        console.log(`Shot Fired at (${x},${y}) hit: ${hit}, sunk: ${sunk}, from: ${address}`);
        setTurn(address, hit, sunk);
        displayShot(address, x, y, hit, sunk);
    });

    contract.on("Payout", (winner, amount) => {
        console.log(`Player: ${winner} won: ${amount}`)
        onPayout(winner, amount);
    });



    console.log("Listeners added!")
}


async function onCellClickOpp(row, col) {
    console.log(`Cell: ${col}|${row} clicked!`)
    if (player === currentTurn && gameState === "gameStarted") {
        console.log("Valid shot");
        const gameContract = new ethers.Contract(gameContractAddress, BATTLESHIP_ABI, signer);
        const tx = await gameContract.shoot(col, row);
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log("valid tx");
        }
    }
}

function rotateShip(shipElement) {
    const isHorizontal = shipElement.dataset.orientation === "horizontal";
    shipElement.dataset.orientation = isHorizontal ? "vertical" : "horizontal";
    shipElement.classList.toggle("vertical");
}

async function commitFleet() {
    if (gameState !== "placementStarted") {
        alert("Can't Commit Fleet!")
        return;
    }

    const btn = document.getElementById("commitBtn");

    const gameContract = new ethers.Contract(gameContractAddress, BATTLESHIP_ABI, signer);
    console.log("Sending placements:", placements);
    const tx = await gameContract.place(placements);
    const receipt = await tx.wait();

    if (receipt.status === 1) {
        btn.innerText = "Fleet Committed!";
        btn.style.backgroundColor = "#27ae60";
        btn.disabled = true
        console.log("Success! Transaction Hash:", tx.hash);

        const shipContainer = document.getElementById("ship-dock-container");
        shipContainer.style.display = "none";

        const resetBtn = document.getElementById("resetBtn");
        resetBtn.style.display = "none";
    }

}

function resetShips() {
    console.log("Resseting Ship Placement");
    placements = [];
    const headerOwn = document.getElementById("ownHeader");
    headerOwn.style.visibility = "visible";
    const tableOwn = document.getElementById("battleShipTableOwn");
    tableOwn.innerHTML = "";
    for (let row = 0; row < boardDim; row++) {
        const tr = document.createElement("tr");
        for (let col = 0; col < boardDim; col++) {
            const td = document.createElement("td");
            td.id = `cell-${row}-${col}`;
            td.className = "game-cell";
            tr.appendChild(td);
        }
        tableOwn.appendChild(tr);
    }
    setupDropZones()

    const dock = document.getElementById("ship-dock");
    dock.innerHTML = "";

    shipSizes.forEach((size, index) => {
        // Create the main ship container
        const shipContainer = document.createElement("div");
        shipContainer.classList.add("ship");
        shipContainer.id = `ship-${index}`;
        shipContainer.dataset.size = size;
        shipContainer.dataset.orientation = "horizontal"; // Default
        shipContainer.draggable = true;

        // Creating visual segments inside the ship
        for (let i = 0; i < size; i++) {
            const segment = document.createElement("div");
            segment.classList.add("ship-segment");
            shipContainer.appendChild(segment);
        }

        shipContainer.addEventListener("click", () => rotateShip(shipContainer));

        // dragstart listener
        shipContainer.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", shipContainer.id);
            shipContainer.classList.add("dragging");
        });

        shipContainer.addEventListener("dragend", () => {
            shipContainer.classList.remove("dragging");
        });

        dock.appendChild(shipContainer);
    });
    checkIfAllShipsPlaced();

}

function checkIfAllShipsPlaced() {
    const commitBtn = document.getElementById("commitBtn");

    let amount = shipSizes.length
    console.log(amount)

    if (placements.length === amount) {
        commitBtn.disabled = false;
        console.log("All ships placed! Ready to commit.");
    } else {
        commitBtn.disabled = true;
    }
}

function handleShipDrop(shipElement, row, col) {
    const size = parseInt(shipElement.dataset.size);
    const orientation = shipElement.dataset.orientation;
    const dim = 10; // Assuming a 10x10 board


    // Check out of bounds
    if (orientation === "horizontal" && (col + size) > dim) return alert("Out of bounds!");
    if (orientation === "vertical" && (row + size) > dim) return alert("Out of bounds!");

    // Check if Cell is free
    for (let i = 0; i < size; i++) {
        let r = orientation === "vertical" ? row + i : row;
        let c = orientation === "horizontal" ? col + i : col;
        if (document.getElementById(`cell-${r}-${c}`).classList.contains("ship-placed")) {
            alert("Space already occupied!");
            return;
        }
    }

    // Place in Grid
    for (let i = 0; i < size; i++) {
        let r = orientation === "vertical" ? row + i : row;
        let c = orientation === "horizontal" ? col + i : col;

        const targetCell = document.getElementById(`cell-${r}-${c}`);

        // Visuals
        targetCell.classList.add("ship-placed");

        if (i === 0) targetCell.classList.add(orientation === "horizontal" ? "ship-start-horizontal" : "ship-start-vertical");
        if (i === size - 1) targetCell.classList.add(orientation === "horizontal" ? "ship-end-horizontal" : "ship-end-vertical");


    }
    placements.push([col, row, orientation === "vertical" ? 1 : 0])

    console.log(placements)

    shipElement.style.visibility = "hidden";
    shipElement.draggable = false;

    checkIfAllShipsPlaced()

}

function setupDropZones() {
    const cells = document.querySelectorAll(".game-cell");

    cells.forEach(cell => {
        cell.addEventListener("dragover", (e) => {
            e.preventDefault();
            cell.classList.add("drag-over");
        });

        cell.addEventListener("dragleave", () => {
            cell.classList.remove("drag-over");
        });

        cell.addEventListener("drop", (e) => {
            e.preventDefault();
            cell.classList.remove("drag-over");


            const shipId = e.dataTransfer.getData("text/plain");
            const shipElement = document.getElementById(shipId);

            const coords = cell.id.split("-");
            const row = parseInt(coords[1]);
            const col = parseInt(coords[2]);

            handleShipDrop(shipElement, row, col);
        });
    });

}


function initGame(p1, p2, starter, dim, sizes, wager, instanceAddress) {
    addressP1 = p1;
    addressP2 = p2;
    boardDim = dim;
    shipSizes = sizes
    gameContractAddress = instanceAddress
    startingPlayer = starter;
    currentTurn = starter;
    gameWager = wager;

    otherPlayer = player === p1? p2 : p1;

    document.getElementById("depositBtn").style.visibility = "visible";

    const playerInd = document.getElementById("player")
    playerInd.style.visibility = "visible";
    playerInd.innerText = "You are Player".concat(player === addressP1 ? " 1" : " 2");

    document.getElementById("joinQueueBtn").style.visibility = "hidden";
    document.getElementById("leaveQueueBtn").style.visibility = "hidden";

    document.getElementById("resetGameBtn").style.visibility = "hidden";

    document.getElementById("player1Deposited").style.visibility = "visible"
    document.getElementById("player2Deposited").style.visibility = "visible"

    document.getElementById("controls").style.visibility = "visible"

    // set wager
    const wagerField = document.getElementById("wager")
    wagerField.innerText = `Wager: ${wager}`
    wagerField.style.visibility = "visible"

    // set gameContractId
    const gameContractId = document.getElementById("gameContractId")
    gameContractId.innerText = instanceAddress
    gameContractId.style.visibility = "visible"

    // Setting Player Addresses
    const displayAddress1 = `${p1.substring(0, 6)}...${p1.substring(p1.length - 4)}`;
    const displayAddress2 = `${p2.substring(0, 6)}...${p2.substring(p2.length - 4)}`;
    document.getElementById("player1Address").innerText = displayAddress1;
    document.getElementById("player2Address").innerText = displayAddress2;

    // Setup Boards
    // Own Board
    const headerOwn = document.getElementById("ownHeader");
    headerOwn.style.visibility = "visible";
    const tableOwn = document.getElementById("battleShipTableOwn");
    tableOwn.innerHTML = "";
    for (let row = 0; row < dim; row++) {
        const tr = document.createElement("tr");
        for (let col = 0; col < dim; col++) {
            const td = document.createElement("td");
            td.id = `cell-${row}-${col}`;
            td.className = "game-cell";
            tr.appendChild(td);
        }
        tableOwn.appendChild(tr);
    }
    // Opponents Board
    const headerOpp = document.getElementById("oppHeader");
    headerOpp.style.visibility = "visible";
    const tableOpp = document.getElementById("battleShipTableOpp");
    tableOpp.innerHTML = "";
    for (let row = 0; row < dim; row++) {
        const tr = document.createElement("tr");
        for (let col = 0; col < dim; col++) {
            const td = document.createElement("td");
            td.id = `opp-cell-${row}-${col}`;
            td.className = "game-cell";
            td.addEventListener("click", () => onCellClickOpp(row, col));
            tr.appendChild(td);
        }
        tableOpp.appendChild(tr);
    }

    setupDropZones();

    console.log(`Tables of ${dim}x${dim} generated!`);

    // show ships
    const dock = document.getElementById("ship-dock");
    dock.innerHTML = "";

    sizes.forEach((size, index) => {
        // Create the main ship container
        const shipContainer = document.createElement("div");
        shipContainer.classList.add("ship");
        shipContainer.id = `ship-${index}`;
        shipContainer.dataset.size = size;
        shipContainer.dataset.orientation = "horizontal"; // Default
        shipContainer.draggable = true;

        // Creating visual segments inside the ship
        for (let i = 0; i < size; i++) {
            const segment = document.createElement("div");
            segment.classList.add("ship-segment");
            shipContainer.appendChild(segment);
        }

        shipContainer.addEventListener("click", () => rotateShip(shipContainer));

        // dragstart listener
        shipContainer.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", shipContainer.id);
            shipContainer.classList.add("dragging");
        });

        shipContainer.addEventListener("dragend", () => {
            shipContainer.classList.remove("dragging");
        });

        dock.appendChild(shipContainer);
    });

}

function onInstanceCreation(p1, p2, starter, dim, sizes, wager, instanceAddress) {
    console.log("New Instance Created")
    if(player === p1 || player === p2) {
        setupGameListener(instanceAddress);
        console.log("init")
        initGame(p1, p2, starter, dim, sizes, wager, instanceAddress);
    }
}

function onMatchFound(p1, p2, instanceAddress) {

}

function onJoinedQueue(waitee) {
    console.log("Event: Queue joined!")
}

function onLeftQueue(removee) {
    console.log("Event: Queue left!")
}

async function init() {
    const deployer = new ethers.Contract(deployerAddress, DEPLOYER_ABI, provider);

    console.log("Waiting for someone to create a game...");
    signer = await provider.getSigner();
    player = await signer.getAddress();
    console.log(`Player: ${player}`);

    // Deployer Events
    deployer.on("InstanceCreation", (p1, p2, starter, dim, sizes, wager, instanceAddress) => onInstanceCreation(p1, p2, starter, dim, sizes, wager, instanceAddress));
    deployer.on("MatchFound", (p1, p2, instanceAddress) => onMatchFound(p1, p2, instanceAddress));
    deployer.on("AddedToSimpleWaitingList",(waitee) => onJoinedQueue(waitee));
    deployer.on("RemovedFromSimpleWaitingList", (removee) => onLeftQueue(removee));
}

if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    init();
} else {
    console.log("Please install MetaMask!");
}


// Debug Functions
window.debugInfo = debugInfo;
window.debugSwitchPlayers = debugSwitchPlayers;
function debugInfo() {
    return `Player: ${player}
            CurrentTurn: ${currentTurn}`;
}
function debugSwitchPlayers() {
    if(currentTurn === addressP1) {
        currentTurn = addressP2;
    } else {
        currentTurn = addressP1;
    }
    displayPlayerTurn();
    return ""

}