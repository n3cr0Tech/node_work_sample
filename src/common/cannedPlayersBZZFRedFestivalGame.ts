import { LeaderboardData } from "../models/LeaderboardData";
const CannedBZZFRedFestivalGame = [
    {
        "username": "ElksFan",
        "playerUUID": "canned-player-9108",
        "machineUUID": "canned-machine-240",
        "gameName": "BZZFRedFestival",
        "multiplier": 345,
        "prevPosition": 1,
        "curPosition": 1,
        "avatarID": "cherries"
    },
    {
        "username": "QueenieQueen",
        "playerUUID": "canned-player-4477",
        "machineUUID": "canned-machine-7198",
        "gameName": "BZZFRedFestival",
        "multiplier": 268,
        "prevPosition": 2,
        "curPosition": 2,
        "avatarID": "heels"
    },
    {
        "username": "SunnyDay",
        "playerUUID": "canned-player-9901",
        "machineUUID": "canned-machine-6323",
        "gameName": "BZZFRedFestival",
        "multiplier": 200,
        "prevPosition": 3,
        "curPosition": 3,
        "avatarID": "cat"
    },
    {
        "username": "Woldorf",
        "playerUUID": "canned-player-9707",
        "machineUUID": "canned-machine-2586",
        "gameName": "BZZFRedFestival",
        "multiplier": 271,
        "prevPosition": 4,
        "curPosition": 4,
        "avatarID": "chess"
    },
    {
        "username": "RadRacerLV",
        "playerUUID": "canned-player-1381",
        "machineUUID": "canned-machine-3162",
        "gameName": "BZZFRedFestival",
        "multiplier": 268,
        "prevPosition": 5,
        "curPosition": 5,
        "avatarID": "car"
    },
    {
        "username": "WalterWW",
        "playerUUID": "canned-player-1323",
        "machineUUID": "canned-machine-8425",
        "gameName": "BZZFRedFestival",
        "multiplier": 113,
        "prevPosition": 6,
        "curPosition": 6,
        "avatarID": "glasses"
    },
    {
        "username": "CollinBetta",
        "playerUUID": "canned-player-9125",
        "machineUUID": "canned-machine-1667",
        "gameName": "BZZFRedFestival",
        "multiplier": 62,
        "prevPosition": 7,
        "curPosition": 7,
        "avatarID": "basketball"
    },
    {
        "username": "Slotzzy",
        "playerUUID": "canned-player-5161",
        "machineUUID": "canned-machine-6317",
        "gameName": "BZZFRedFestival",
        "multiplier": 23,
        "prevPosition": 8,
        "curPosition": 8,
        "avatarID": "car"
    },
    {
        "username": "CliffMach5",
        "playerUUID": "canned-player-5642",
        "machineUUID": "canned-machine-6785",
        "gameName": "BZZFRedFestival",
        "multiplier": 12,
        "prevPosition": 9,
        "curPosition": 9,
        "avatarID": "football"
    },
    {
        "username": "SlotLizard",
        "playerUUID": "canned-player-345",
        "machineUUID": "canned-machine-6367",
        "gameName": "BZZFRedFestival",
        "multiplier": 10,
        "prevPosition": 10,
        "curPosition": 10,
        "avatarID": "dog"
    }
]
export function GetCannedPlayers(){
    let deepCopy = CannedBZZFRedFestivalGame.map(x => Object.assign({}, x));
    return deepCopy;
}