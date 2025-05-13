import { LeaderboardData } from "../models/LeaderboardData";

const CannedPlayersBuffaloGame = [
    {
        "username": "AstralDreamer",
        "playerUUID": "canned-player-5664",
        "machineUUID": "canned-machine-5407",
        "gameName": "buffalo-game",
        "multiplier": 7833,
        "prevPosition": 1,
        "curPosition": 1,
        "avatarID": "dog"
    },
    {
        "username": "FrostNova",
        "playerUUID": "canned-player-5682",
        "machineUUID": "canned-machine-4562",
        "gameName": "buffalo-game",
        "multiplier": 63105,
        "prevPosition": 2,
        "curPosition": 2,
        "avatarID": "dog"
    },
    {
        "username": "IroncladWarrior",
        "playerUUID": "canned-player-9431",
        "machineUUID": "canned-machine-8476",
        "gameName": "buffalo-game",
        "multiplier": 24010,
        "prevPosition": 3,
        "curPosition": 3,
        "avatarID": "dog"
    },
    {
        "username": "EagleEye23",
        "playerUUID": "canned-player-6510",
        "machineUUID": "canned-machine-6819",
        "gameName": "buffalo-game",
        "multiplier": 5230,
        "prevPosition": 4,
        "curPosition": 4,
        "avatarID": "dog"
    },
    {
        "username": "CeruleanWave",
        "playerUUID": "canned-player-4812",
        "machineUUID": "canned-machine-6668",
        "gameName": "buffalo-game",
        "multiplier": 9481,
        "prevPosition": 5,
        "curPosition": 5,
        "avatarID": "dog"
    },
    {
        "username": "StarGazer88",
        "playerUUID": "canned-player-9112",
        "machineUUID": "canned-machine-3514",
        "gameName": "buffalo-game",
        "multiplier": 58240,
        "prevPosition": 6,
        "curPosition": 6,
        "avatarID": "dog"
    },
    {
        "username": "SilentNinja",
        "playerUUID": "canned-player-3066",
        "machineUUID": "canned-machine-7070",
        "gameName": "buffalo-game",
        "multiplier": 94523,
        "prevPosition": 7,
        "curPosition": 7,
        "avatarID": "dog"
    },
    {
        "username": "CrimsonWanderer",
        "playerUUID": "canned-player-3437",
        "machineUUID": "canned-machine-1329",
        "gameName": "buffalo-game",
        "multiplier": 44102,
        "prevPosition": 8,
        "curPosition": 8,
        "avatarID": "dog"
    },
    {
        "username": "SolarPhoenix",
        "playerUUID": "canned-player-5113",
        "machineUUID": "canned-machine-6530",
        "gameName": "buffalo-game",
        "multiplier": 35647,
        "prevPosition": 9,
        "curPosition": 9,
        "avatarID": "dog"
    },
    {
        "username": "MoonlitSorcerer",
        "playerUUID": "canned-player-5655",
        "machineUUID": "canned-machine-5607",
        "gameName": "buffalo-game",
        "multiplier": 39651,
        "prevPosition": 10,
        "curPosition": 10,
        "avatarID": "dog"
    }
]

export function GetCannedPlayers(): LeaderboardData[]{
    let deepCopy = CannedPlayersBuffaloGame.map(x => Object.assign({}, x));
    return deepCopy;
}