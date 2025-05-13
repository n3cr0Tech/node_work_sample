import { LeaderboardData } from "../models/LeaderboardData";
const CannedBuffaloGoldGame = [
    {
        "username": "Barlow",
        "playerUUID": "canned-player-7059",
        "machineUUID": "canned-machine-4729",
        "gameName": "BuffaloGold",
        "multiplier": 453,
        "prevPosition": 1,
        "curPosition": 1,
        "avatarID": "dog"
    },
    {
        "username": "IAmBatman",
        "playerUUID": "canned-player-6739",
        "machineUUID": "canned-machine-9798",
        "gameName": "BuffaloGold",
        "multiplier": 450,
        "prevPosition": 2,
        "curPosition": 2,
        "avatarID": "bike"
    },
    {
        "username": "Reeter",
        "playerUUID": "canned-player-1553",
        "machineUUID": "canned-machine-4214",
        "gameName": "BuffaloGold",
        "multiplier": 355,
        "prevPosition": 3,
        "curPosition": 3,
        "avatarID": "palmtree"
    },
    {
        "username": "Slotzzy",
        "playerUUID": "canned-player-6778",
        "machineUUID": "canned-machine-9827",
        "gameName": "BuffaloGold",
        "multiplier": 346,
        "prevPosition": 4,
        "curPosition": 4,
        "avatarID": "car"
    },
    {
        "username": "CragM1re",
        "playerUUID": "canned-player-2453",
        "machineUUID": "canned-machine-5106",
        "gameName": "BuffaloGold",
        "multiplier": 175,
        "prevPosition": 5,
        "curPosition": 5,
        "avatarID": "basketball"
    },
    {
        "username": "WalterWW",
        "playerUUID": "canned-player-1091",
        "machineUUID": "canned-machine-2794",
        "gameName": "BuffaloGold",
        "multiplier": 163,
        "prevPosition": 6,
        "curPosition": 6,
        "avatarID": "glasses"
    },
    {
        "username": "NessyInScotland",
        "playerUUID": "canned-player-3715",
        "machineUUID": "canned-machine-8579",
        "gameName": "BuffaloGold",
        "multiplier": 75,
        "prevPosition": 7,
        "curPosition": 7,
        "avatarID": "heels"
    },
    {
        "username": "BuffyGold",
        "playerUUID": "canned-player-4448",
        "machineUUID": "canned-machine-6119",
        "gameName": "BuffaloGold",
        "multiplier": 71,
        "prevPosition": 8,
        "curPosition": 8,
        "avatarID": "martini"
    },
    {
        "username": "MrWinnerTime",
        "playerUUID": "canned-player-8750",
        "machineUUID": "canned-machine-9835",
        "gameName": "BuffaloGold",
        "multiplier": 64,
        "prevPosition": 9,
        "curPosition": 9,
        "avatarID": "beer"
    },
    {
        "username": "CatchEm1015",
        "playerUUID": "canned-player-3702",
        "machineUUID": "canned-machine-6156",
        "gameName": "BuffaloGold",
        "multiplier": 60,
        "prevPosition": 10,
        "curPosition": 10,
        "avatarID": "pizza"
    }
]
export function GetCannedPlayers(){
    let deepCopy = CannedBuffaloGoldGame.map(x => Object.assign({}, x));
    return deepCopy;
}