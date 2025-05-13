import { LeaderboardData } from "../models/LeaderboardData";
const CannedWildLepreCoinsGame = [
    {
        "username": "Vegas7s",
        "playerUUID": "canned-player-6062",
        "machineUUID": "canned-machine-511",
        "gameName": "WildLepreCoins",
        "multiplier": 288,
        "prevPosition": 1,
        "curPosition": 1,
        "avatarID": "dice"
    },
    {
        "username": "Calesser",
        "playerUUID": "canned-player-1148",
        "machineUUID": "canned-machine-6838",
        "gameName": "WildLepreCoins",
        "multiplier": 270,
        "prevPosition": 2,
        "curPosition": 2,
        "avatarID": "beer"
    },
    {
        "username": "PongIL",
        "playerUUID": "canned-player-8632",
        "machineUUID": "canned-machine-257",
        "gameName": "WildLepreCoins",
        "multiplier": 201,
        "prevPosition": 3,
        "curPosition": 3,
        "avatarID": "glasses"
    },
    {
        "username": "MiuManta",
        "playerUUID": "canned-player-8614",
        "machineUUID": "canned-machine-6075",
        "gameName": "WildLepreCoins",
        "multiplier": 159,
        "prevPosition": 4,
        "curPosition": 4,
        "avatarID": "cards"
    },
    {
        "username": "FancyDoug",
        "playerUUID": "canned-player-1012",
        "machineUUID": "canned-machine-4732",
        "gameName": "WildLepreCoins",
        "multiplier": 157,
        "prevPosition": 5,
        "curPosition": 5,
        "avatarID": "mic"
    },
    {
        "username": "Laura808",
        "playerUUID": "canned-player-8666",
        "machineUUID": "canned-machine-7811",
        "gameName": "WildLepreCoins",
        "multiplier": 145,
        "prevPosition": 6,
        "curPosition": 6,
        "avatarID": "chess"
    },
    {
        "username": "Maderm",
        "playerUUID": "canned-player-6507",
        "machineUUID": "canned-machine-3167",
        "gameName": "WildLepreCoins",
        "multiplier": 89,
        "prevPosition": 7,
        "curPosition": 7,
        "avatarID": "dog"
    },
    {
        "username": "FuzzyFish",
        "playerUUID": "canned-player-9055",
        "machineUUID": "canned-machine-480",
        "gameName": "WildLepreCoins",
        "multiplier": 76,
        "prevPosition": 8,
        "curPosition": 8,
        "avatarID": "cat"
    },
    {
        "username": "WavesDot",
        "playerUUID": "canned-player-547",
        "machineUUID": "canned-machine-1433",
        "gameName": "WildLepreCoins",
        "multiplier": 75,
        "prevPosition": 9,
        "curPosition": 9,
        "avatarID": "hockey"
    },
    {
        "username": "Ice2Free",
        "playerUUID": "canned-player-2072",
        "machineUUID": "canned-machine-1728",
        "gameName": "WildLepreCoins",
        "multiplier": 63,
        "prevPosition": 10,
        "curPosition": 10,
        "avatarID": "palmtree"
    }
]
export function GetCannedPlayers(){
    let deepCopy = CannedWildLepreCoinsGame.map(x => Object.assign({}, x));
    return deepCopy;
}