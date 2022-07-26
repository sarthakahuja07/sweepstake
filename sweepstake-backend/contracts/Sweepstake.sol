// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

error Sweepstake__not_enough_entrance_fee(uint256 _amount);
error Sweepstake__state__notOpen();

contract Sweepstake {
    enum SweepStake_state {
        NOT_STARTED,
        OPEN,
        ENDED
    }

    uint256 private i_entranceFee;
    address payable[] private s_entrants;
    SweepStake_state private s_state;

    event SweepStake__sweepStatkeEnter(address indexed entrant);

    constructor(uint256 _entranceFee) {
        i_entranceFee = _entranceFee;
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
}
