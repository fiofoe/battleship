pragma solidity >=0.8.2 <0.9.0;

contract Battleship{

    enum CellState { Empty, Ship, ShipHit }
    CellState[10][10] public boardPlayer1; //Schiffe von Player 1, Player 2 schiesst drauf
    CellState[10][10] public boardPlayer2; //Schiffe von Player 2, Player 1 schiesst drauf
    enum GameState{
        Created,
        WaitingForPlayer2,
        Player1Turn,
        Player2Turn,
        GameOver
    }

    struct Guess {
        uint8 x;
        uint8 y;
    }

    struct Ship{
        uint8 x;
        uint8 y;
        bool direction; // 1 for vertical; 0 for horizontal
        uint8 length;
    }

    address public player1;
    address public player2;
    address public currentTurn;
    address public winner;
//events

    event ShotFired(
    address indexed shooter,
    uint8 x,
    uint8 y,
    bool hit,
    bool sunk
    );

// functions
    function shoot(uint8 x, uint8 y) external returns (bool hitResult) {
        require(
            (msg.sender == player1 && currentTurn == player1) ||
            (msg.sender == player2 && currentTurn == player2), 
            "It is not your turn"
        );
        require(x < 10 && y < 10, "Invalid coordinates");

        //determine board
        CellState[10][10] storage opponentBoard = (msg.sender == player1) ? boardPlayer2 : boardPlayer1;

        //prevent double shooting
        require(opponentBoard[x][y] != CellState.ShipHit,"Already shot here");

        bool isSunk = false;
        bool isHit = false;

        if (opponentBoard[x][y] == CellState.Ship) {
            isHit = true;
            opponentBoard[x][y] = CellState.ShipHit;
            isSunk = !(
                (x > 0 && opponentBoard[x - 1][y] == CellState.Ship) || // check left
                (x < 9 && opponentBoard[x + 1][y] == CellState.Ship) || // check right
                (y > 0 && opponentBoard[x][y - 1] == CellState.Ship) || // check above
                (y < 9 && opponentBoard[x][y + 1] == CellState.Ship) // check below
             );
        }

        emit ShotFired(msg.sender, x, y, isHit, isSunk);

        // switch turns only if miss
        if (!isHit) {
            currentTurn = (currentTurn == player1) ? player2 : player1;
        }

        return isHit;
    }
}
