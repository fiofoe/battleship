pragma solidity >=0.8.2 < 0.9.0;

contract Battleship{

    enum CellState { Empty, Ship, ShipHit }
    CellState[][] public boardPlayer1; //Schiffe von Player 1, Player 2 schiesst drauf
    CellState[][] public boardPlayer2; //Schiffe von Player 2, Player 1 schiesst drauf
    uint8 public dimension = 10;
    uint8[] public shipsizes = [5, 4, 3, 3, 2];
    GameState public phase = GameState.Placements;

    uint32 wageredAmount;

    bool playerAhasDeposited;
    bool playerBhasDeposited;

    enum GameState{
        Created,
        WaitingForPlayer2,
        Placements,
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

    event Payout(address winner, uint256 amount);

// functions

    function shoot(uint8 x, uint8 y) external returns (bool hitResult) {
        require(
            (msg.sender == player1 && currentTurn == player1) ||
            (msg.sender == player2 && currentTurn == player2), 
            "It is not your turn"
        );
        require(x < dimension && y < dimension, "Invalid coordinates");

        //determine board
        CellState[][] storage opponentBoard = (msg.sender == player1) ? boardPlayer2 : boardPlayer1;

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

        // shipsSunken++
        // if all ships have sunken
        // set winning address
        // endGame()

        emit ShotFired(msg.sender, x, y, isHit, isSunk);

        // switch turns only if miss
        if (!isHit) {
            currentTurn = (currentTurn == player1) ? player2 : player1;
        }

        return isHit;
    }


    function place(uint8  [][] calldata placements) external returns (bool valid){ //definiert nur für player 1
        require(phase ==GameState.Placements, "No changes to Placements are accepted at this time");
        CellState[][] memory board = new CellState[][](dimension);
        for(uint8 col=0; col<dimension; col++){
                CellState [] memory column = new CellState[] (dimension);
                for(uint8 row =0; row<dimension; row++){
                    column[row]=CellState.Empty;
                }
                board[col] = column;
            }
        for(uint8 i=0; i< placements.length; i++){
            
            uint8 x = placements[i][0];
            uint8 y = placements[i][1];
            uint8 direction = placements[i][2];
            uint8 length = shipsizes[i];
            


            require(x<dimension && y<dimension && x>=0 && y>=0, "Invalid placement");
            if(direction == 0){
                require(x+length-1<dimension, "Invalid Placement");
                if(x>0){
                    require(board[x-1][y]!=CellState.Ship, "Adjacent placings are prohibeted");
                }
                if(x<dimension-length){
                    require(board[x+length][y]!=CellState.Ship, "Adjacent placings are prohibeted");
                }
                
                for(uint8 j=0; j<length; j++){
                    require(board[x+j][y]!=CellState.Ship, "Conflict");
                    if(y>0)
                    {
                        require(board[x+j][y-1]!=CellState.Ship, "Adjacent placings are prohibeted");
                    }
                    if(y<dimension-1)
                    {
                        require(board[x+j][y+1]!=CellState.Ship, "Adjacent placings are prohibeted");
                    }
                    board[x+j][y]= CellState.Ship;
                }
            }

           if(direction == 1){
                require(y+length-1<dimension, "Invalid Placement");
                if(y>0){
                    require(board[x][y-1]!=CellState.Ship, "Adjacent placings are prohibeted");
                }
                if(y<dimension-length){
                    require(board[x][y+length]!=CellState.Ship, "Adjacent placings are prohibeted");
                }
                
                for(uint8 j=0; j<length; j++){
                    require(board[x][y+j]!=CellState.Ship, "Conflict");
                    if(x>0)
                    {
                        require(board[x-1][y+j]!=CellState.Ship, "Adjacent placings are prohibeted");
                    }
                    if(x<dimension-1)
                    {
                        require(board[x+1][y+j]!=CellState.Ship, "Adjacent placings are prohibeted");
                    }
                    board[x][y+j]= CellState.Ship;
                }
            }
        
        }
        if(msg.sender == player1)
        {
            boardPlayer1 = board;
            return true;
        }
        else if(msg.sender == player2)
        {
            boardPlayer2 = board;
            return true;
        }
        require(false, "You are not a Player in this game");
    }


    function endGame() public{
        (bool success, ) = winner.call{value: address(this).balance}("");
        require(success, "Transfer failed");

        emit Payout(winner, wageredAmount * 2);
    }

}




