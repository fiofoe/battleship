export const DEPLOYER_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "Waitee",
                "type": "address"
            }
        ],
        "name": "AddedToSimpleWaitingList",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "P1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "P2",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "Starting_Player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "Board_Dimension",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8[]",
                "name": "Ship_Sizes",
                "type": "uint8[]"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "wager",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "contract Battleship",
                "name": "Instance",
                "type": "address"
            }
        ],
        "name": "InstanceCreation",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "makeSimpleRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "P1",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "P2",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "contract Battleship",
                "name": "Instance",
                "type": "address"
            }
        ],
        "name": "MatchFound",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "P1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "P2",
                "type": "address"
            },
            {
                "internalType": "uint8",
                "name": "Board_Dimension",
                "type": "uint8"
            },
            {
                "internalType": "uint8[]",
                "name": "Ship_Sizes",
                "type": "uint8[]"
            },
            {
                "internalType": "uint256",
                "name": "wager",
                "type": "uint256"
            }
        ],
        "name": "newGameInstance",
        "outputs": [
            {
                "internalType": "contract Battleship",
                "name": "GameAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "Removee",
                "type": "address"
            }
        ],
        "name": "RemovedFromSimpleWaitingList",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "requestRemoval",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "randnonce",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "standardBoardDimension",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "standardShipSizes",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "standardWager",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export const BATTLESHIP_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "P1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "P2",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "P1Starts",
                "type": "bool"
            },
            {
                "internalType": "uint8",
                "name": "Board_Dimension",
                "type": "uint8"
            },
            {
                "internalType": "uint8[]",
                "name": "Ship_Sizes",
                "type": "uint8[]"
            },
            {
                "internalType": "uint256",
                "name": "Entry_Fee",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "winnerByDefault",
                "type": "address"
            }
        ],
        "name": "Default",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "payee",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Deposit_Made",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Game_Start",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Payout",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "Placement",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Placements_Start",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "Reset",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "shooter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "x",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "y",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "hit",
                "type": "bool"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "sunk",
                "type": "bool"
            }
        ],
        "name": "ShotFired",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "boardPlayer1",
        "outputs": [
            {
                "internalType": "enum Battleship.CellState",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "boardPlayer2",
        "outputs": [
            {
                "internalType": "enum Battleship.CellState",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimDefault",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentTurn",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "dimension",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "phase",
        "outputs": [
            {
                "internalType": "enum Battleship.GameState",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint8[][]",
                "name": "placements",
                "type": "uint8[][]"
            }
        ],
        "name": "place",
        "outputs": [
            {
                "internalType": "bool",
                "name": "valid",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "player1",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "player2",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "reset",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "shipsSunkByPlayer1",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "shipsSunkByPlayer2",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "shipsizes",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "x",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "y",
                "type": "uint8"
            }
        ],
        "name": "shoot",
        "outputs": [
            {
                "internalType": "bool",
                "name": "hitResult",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "startingPlayer",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wageredAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "winner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
