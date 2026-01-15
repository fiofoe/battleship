pragma solidity >=0.8.2 <0.9.0;

contract Battleship{

    enum CellState { Empty, Ship, ShipHit }
    uint public dimension = 10;
    CellState[dimension][dimension] public boardPlayer1; //Schiffe von Player 1, Player 2 schiesst drauf
    CellState[dimension][dimension] public boardPlayer2; //Schiffe von Player 1, Player 2 schiesst drauf
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


}
