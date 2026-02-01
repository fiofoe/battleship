pragma solidity >=0.8.2 < 0.9.0;

contract Battleship{

    enum CellState { Empty, Ship, ShipHit }
    CellState[][] public boardPlayer1; //Schiffe von Player 1, Player 2 schiesst drauf
    CellState[][] public boardPlayer2; //Schiffe von Player 2, Player 1 schiesst drauf
    uint8 public dimension = 10;
    uint8[] public shipsizes = [5, 4, 3, 3, 2];
    GameState public phase = GameState.Created;
    uint timeout = 24 hours;


    uint256 lastInteraction;
    uint256 public wageredAmount;

    bool player1hasDeposited = false;
    bool player2hasDeposited = false;
    bool player1hasPlaced = false;
    bool player2hasPlaced = false;

    uint8 public shipsSunkByPlayer1;
    uint8 public shipsSunkByPlayer2;

    enum GameState{
        Created,
        Placements,
        GameStarted,
        Payout,
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
    address public startingPlayer;
    address public winner;


//events
    event Deposit_Made(address payee, uint256 amount);
    event Game_Start();
    event Placements_Start();
    event Placement(address player);
    event Default(address winnerByDefault);
    event Reset();
    event ShotFired(
    address indexed shooter,
    uint8 x,
    uint8 y,
    bool hit,
    bool sunk
    );

    event Payout(address winner, uint256 amount);

//constructor
    constructor(address P1, address P2, bool P1Starts, uint8 Board_Dimension, uint8[] memory Ship_Sizes, uint256 Entry_Fee ){
        player1 = P1;
        player2 = P2;
        dimension = Board_Dimension;
        shipsizes = Ship_Sizes;
        wageredAmount = Entry_Fee;
        phase = GameState.Created;
        currentTurn = (P1Starts) ? player1 : player2;
        startingPlayer=currentTurn;
        shipsSunkByPlayer1 = 0;
        shipsSunkByPlayer2 = 0;
        lastInteraction = block.timestamp;
    
    }

// functions

    function deposit() payable external{
        require(msg.sender ==player1 || msg.sender == player2, "You are not a player");
        require(phase==GameState.Created, "Game has already started");
        if(msg.sender == player1)
        {   
            require(!player1hasDeposited, "You have already payed");
            require(msg.value == wageredAmount, "Please deposit the correct amount");
            player1hasDeposited = true;
            emit Deposit_Made(player1, msg.value);
        }
        else if(msg.sender == player2)
        {
            require(!player2hasDeposited, "You have already payed");
            require(msg.value == wageredAmount, "Please deposit the correct amount");
            player2hasDeposited = true;
            emit Deposit_Made(player2, msg.value);
        }
        if(player1hasDeposited && player2hasDeposited) {
            phase = GameState.Placements;
            emit Placements_Start();
        }
        lastInteraction = block.timestamp;
    }

    function shoot(uint8 x, uint8 y) external returns (bool hitResult){
        require(phase == GameState.GameStarted, "The Game is not in progress");
        require(
            (msg.sender == player1 && currentTurn == player1) ||
            (msg.sender == player2 && currentTurn == player2), 
            "It is not your turn"
        );
        require(x < dimension && y < dimension, "Invalid coordinates");
        // require(phase == GameState.Player1Turn || phase == GameState.Player2Turn, "Game not active");

        //determine board
        CellState[][] storage opponentBoard = (msg.sender == player1) ? boardPlayer2 : boardPlayer1;

        //prevent double shooting
        require(opponentBoard[x][y] != CellState.ShipHit,"Already shot here");

        bool isSunk = false;
        bool isHit = false;

        if (opponentBoard[x][y] == CellState.Ship) {
            isHit = true;
            opponentBoard[x][y] = CellState.ShipHit;

            bool foundRemainingShip = false;
            // scan left
            if (x > 0) {
                for (int i = int(uint256(x)) - 1; i >= 0; i--) {
                if (opponentBoard[uint8(uint256(i))][y] == CellState.Ship) {
                    foundRemainingShip = true;
                  break;
                }
                if (opponentBoard[uint8(uint256(i))][y] == CellState.Empty) {
                    break;
                }
                }

            }
            // scan right
            if (x < dimension - 1) {
                for (uint8 i = x + 1; i < dimension; i++) {
                    if (opponentBoard[i][y] == CellState.Ship) {
                        foundRemainingShip = true;
                        break;
                    }
                    if (opponentBoard[i][y] == CellState.Empty) {
                        break;
                    }
                }
            }
            // scan up
            if (y > 0) {
                for (int j = int(uint256(y)) - 1; j >= 0 ; j--) {
                    if (opponentBoard[x][uint8(uint256(j))] == CellState.Ship) {
                        foundRemainingShip = true;
                        break;
                    }
                    if (opponentBoard[x][uint8(uint256(j))] == CellState.Empty) {
                        break;
                    }
                }
            }
             // scan down
            if (y < dimension - 1)  {
                for (uint8 j = y + 1; j < dimension; j++) {
                    if (opponentBoard[x][j] == CellState.Ship) {
                        foundRemainingShip = true;
                        break;
                    }
                    if (opponentBoard[x][j] == CellState.Empty) {
                        break;
                    }
                }
            }

            isSunk = !foundRemainingShip;

            if (isSunk) {
                if(msg.sender == player1) {
                    shipsSunkByPlayer1++;
                    if (shipsSunkByPlayer1 == shipsizes.length) {
                        winner = player1;
                        phase = GameState.Payout;
                        endGame();
                    }
                } else {
                    shipsSunkByPlayer2++;
                    if (shipsSunkByPlayer2 == shipsizes.length) {
                        winner = player2;
                        phase = GameState.Payout;
                        endGame();
                    }
                }
            }
        }
        // endGame()
        emit ShotFired(msg.sender, x, y, isHit, isSunk);

        // switch turns only if miss
        if (!isHit) {
            currentTurn = (currentTurn == player1) ? player2 : player1;
        }
        lastInteraction = block.timestamp;
        return (isHit);
    }


    function place(uint8  [][] calldata placements) external returns (bool valid){ 
        require(msg.sender ==player1 || msg.sender == player2, "You are not a player");
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
                    require(board[x+length][y]!=CellState.Ship, "Adjacent placings are prohibited");
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
            player1hasPlaced = true;
            emit Placement(player1);
          
        }
        else if(msg.sender == player2)
        {
            boardPlayer2 = board;
            player2hasPlaced = true;
            emit Placement(player2);
            
        }
        if(player1hasPlaced && player2hasPlaced){
            phase = GameState.GameStarted;
            emit Game_Start();
        }
        lastInteraction = block.timestamp;
    }


    function claimDefault() public{
        require(msg.sender == player1 || msg.sender == player2, "You are not a player");
        uint time = block.timestamp;
        if(phase==GameState.Created)
        {
            require((time-lastInteraction)>timeout, "Time limit not reached yet");
            if(player1hasDeposited && !player2hasDeposited){
                winner = player1;
                phase = GameState.Payout;
                emit Default(player1);
                endGame();
            }
            else if (!player1hasDeposited && player2hasDeposited)
            {
                winner = player2;
                phase = GameState.Payout;
                emit Default(player2);
                endGame();
            }
        }
        else if(phase == GameState.Placements){
            require((time-lastInteraction)>timeout, "Time limit not reached yet");
            if(player1hasPlaced && !player2hasPlaced){
                winner = player1;
                phase = GameState.Payout;
                emit Default(player1);
                endGame();
            }
            else if (!player1hasPlaced && player2hasPlaced)
            {
                winner = player2;
                phase = GameState.Payout;
                emit Default(player2);
                endGame();
            }
        }
        else if(phase==GameState.GameStarted)
        {
            require((time-lastInteraction)>timeout, "Time limit not reached yet");
            winner = (currentTurn == player1) ? player2 : player1;
            phase = GameState.Payout;
            emit Default(winner);
            endGame();
            
        }
        require(false, "It is not possible to claim a default in this stage of the game");
    }

    function endGame() private{
        require(winner != address(0), "No winner declared");

        require(phase == GameState.Payout, "Not in the Payout Stage");

        phase = GameState.GameOver;
        uint256 amountToPay = address(this).balance;

        (bool success, ) = winner.call{value: amountToPay}("");
        require(success, "Transfer failed");

        emit Payout(winner, amountToPay);
    }


    function reset() public {
        require(phase == GameState.GameOver, "Game is still in progress");
        lastInteraction = block.timestamp;
        phase = GameState.Created;
        winner = address(0);
        startingPlayer = (startingPlayer == player1) ? player2 : player1;
        currentTurn = startingPlayer;
        shipsSunkByPlayer1 = 0;
        shipsSunkByPlayer2 = 0;
        player1hasDeposited = false;
        player2hasDeposited = false;
        player1hasPlaced = false;
        player2hasPlaced = false;
        emit Reset();
    }

}

contract Deployer{
    //structs
   /* struct request
    {
        uint256 wager;
        uint8 Board_Dimension;
        uint8[] Ship_Sizes;
        address P1;
    }
    */
    
    //variables
    //mapping (address => request) requests;
    


    uint public randnonce = 0;
    address private waiting = address(0);
    uint256 public standardWager = 10000000000000000;
    uint8 public standardBoardDimension = 10;
    uint8[] public standardShipSizes = [5,4,3,3,2];


    //Events
    event InstanceCreation(address P1, address P2, address Starting_Player, uint8 Board_Dimension, uint8[] Ship_Sizes, uint256 wager, Battleship Instance);
    event MatchFound (address P1, address P2, Battleship Instance);
    event AddedToSimpleWaitingList ( address Waitee);
    event RemovedFromSimpleWaitingList (address Removee);

 
    

    //functions

    function makeSimpleRequest () public {
        if(waiting == address(0)){
            waiting = msg.sender;
            emit AddedToSimpleWaitingList(msg.sender);
        }
        else
        {
            require(msg.sender!=waiting, "You are already on the waiting list");
            Battleship instance = newGameInstance(waiting, msg.sender, standardBoardDimension, standardShipSizes, standardWager);
            emit MatchFound(waiting, msg.sender, instance);
            
        }
    }
    function requestRemoval() public{
        require(msg.sender == waiting, "You are not currently on the waiting list");
        waiting = address(0);
        emit RemovedFromSimpleWaitingList(msg.sender);
    }

    /*
    function makeCustomRequest  (uint256 wager, uint8 Board_Dimension, uint8[] calldata Ship_Sizes)public{
        request storage req;

        req.wager = wager;
        req.Board_Dimension = Board_Dimension;
        req.Ship_Sizes = Ship_Sizes;

        requests[msg.sender] = req;
    }
    */



    function newGameInstance (address P1, address P2, uint8 Board_Dimension, uint8[] memory Ship_Sizes, uint256 wager)
    public
    returns (Battleship GameAddress)
    {
        Battleship instance = new Battleship(P1,  P2, true, Board_Dimension, Ship_Sizes, wager);
        randnonce++;
        uint rand = uint(keccak256(abi.encodePacked(block.timestamp,P1,P2,randnonce))) % 2;
        address starter =(rand==0) ? P1 : P2;
        emit InstanceCreation(P1,  P2, starter, Board_Dimension, Ship_Sizes, wager,instance);
        return instance;
        
    }


}
