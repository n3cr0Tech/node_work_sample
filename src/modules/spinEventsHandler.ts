
import { PlayerData } from "../models/PlayerData";
import { TrophyData } from "../models/TrophyData";
import { User } from '../models/User';

export class SpinEventsHandler{

    public ResolveSpinEvent(userData: typeof User): typeof User{
        // Update Event Index
        userData.currentEventIndex += 1;
        // Save new event Index onto DB
        return userData;
    }
}

export const SpinEventsHandlerInstance = new SpinEventsHandler();