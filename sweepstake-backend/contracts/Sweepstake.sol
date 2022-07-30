// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

error Sweepstake__not_enough_entrance_fee(uint256 _amount);
error Sweepstake__state__notOpen();
error Sweepstake__transactionFailed();
error SweepStake__upKeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 sweepstakeState
);

contract Sweepstake is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum SweepStake_state {
        OPEN,
        ENDED
    }

    uint256 private immutable i_entranceFee;
    uint256 private immutable i_interval;
    address payable[] private s_entrants;
    SweepStake_state private s_state;
    uint16 private constant NUMWORDS = 1;
    VRFCoordinatorV2Interface private immutable i_coordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 immutable i_callbackGasLimit;
    uint16 constant REQUEST_CONFIMATIONS = 3;
    address private s_latestWinner;
    uint256 private s_latestWinnerAmount;
    uint256 private s_latestWinnerTimestamp;

    event SweepStake__sweepStatkeEnter(address indexed entrant);
    event SweepStake__requestedSweepstakeWinner(uint256 indexed requestId);
    event SweepStake__winnerPicked(address indexed winner);

    constructor(
        uint256 _entranceFee,
        address _vrfCoordinatorAddress,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(_vrfCoordinatorAddress) {
        i_entranceFee = _entranceFee;
        i_subscriptionId = _subscriptionId;
        i_keyHash = _keyHash;
        i_interval = _interval;
        s_state = SweepStake_state.OPEN;
        i_callbackGasLimit = _callbackGasLimit;
        s_latestWinnerTimestamp = block.timestamp;
        i_coordinator = VRFCoordinatorV2Interface(_vrfCoordinatorAddress);
    }

    function enterSweepstake() public payable {
        if (msg.value < i_entranceFee) {
            revert Sweepstake__not_enough_entrance_fee(msg.value);
        }
        if (s_state != SweepStake_state.OPEN) {
            revert Sweepstake__state__notOpen();
        }

        s_entrants.push(payable(msg.sender));
        emit SweepStake__sweepStatkeEnter(msg.sender);
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        uint256 randomWinnerIndex = randomWords[0] % s_entrants.length;
        address payable randomWinner = s_entrants[randomWinnerIndex];
        s_latestWinner = randomWinner;
        s_entrants = new address payable[](0);
        s_state = SweepStake_state.OPEN;
        s_latestWinnerAmount = address(this).balance;
        s_latestWinnerTimestamp = block.timestamp;
        bool success = randomWinner.send(address(this).balance);

        if (!success) {
            revert Sweepstake__transactionFailed();
        }

        emit SweepStake__winnerPicked(randomWinner);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = s_state == SweepStake_state.OPEN;
        bool atLeastOneEntrant = s_entrants.length > 0;
        bool isBalace = address(this).balance > 0;
        bool hasTimedOut = ((block.timestamp - s_latestWinnerTimestamp) >
            i_interval);

        upkeepNeeded = (isOpen && atLeastOneEntrant && isBalace && hasTimedOut);
        return (upkeepNeeded, "0x0");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert SweepStake__upKeepNotNeeded(
                address(this).balance,
                s_entrants.length,
                uint256(s_state)
            );
        }
        if (s_state != SweepStake_state.OPEN) {
            revert Sweepstake__state__notOpen();
        }

        s_state = SweepStake_state.ENDED;
        uint256 requestId = i_coordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIMATIONS,
            i_callbackGasLimit,
            NUMWORDS
        );

        emit SweepStake__requestedSweepstakeWinner(requestId);
    }

    function getEntranceFee() public view returns (uint256 _entranceFee) {
        _entranceFee = i_entranceFee;
    }

    function getEntrant(uint256 index)
        public
        view
        returns (address _entrantAddress)
    {
        return s_entrants[index];
    }

    function getState() public view returns (SweepStake_state _state) {
        _state = s_state;
    }

    function getNumWords() public pure returns (uint _numWords) {
        _numWords = NUMWORDS;
    }

    function getLatestWinner() public view returns (address _winner) {
        _winner = s_latestWinner;
    }

    function getLatestWinnerAmount() public view returns (uint256 _amount) {
        _amount = s_latestWinnerAmount;
    }

    function getLatestWinnerTimeStamp()
        public
        view
        returns (uint256 _timestamp)
    {
        _timestamp = s_latestWinnerTimestamp;
    }

    function getInterval() public view returns (uint256 _interval) {
        _interval = i_interval;
    }

    receive() external payable {}

    fallback() external payable {}
}
