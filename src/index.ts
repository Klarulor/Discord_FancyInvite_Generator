//CONFIG
import {isDataView} from "util/types";

const token: string = undefined ?? require("process").env.TOKEN;
const guildId: string = undefined ?? require("process").env.GUILD;
const channelID: string = undefined ?? require("process").env.CHANNEL;
const inviteMaxLength: number = 10;
const repeatSymbolCount: number = 2;
const repeatEachSymbolCount: number = 3;


let guild: Guild;

import {Client, Guild, Invite} from "discord.js";
const client: Client = new Client({intents: ["GUILD_INVITES"]});
client.login(token);
client.on(`ready`, async () => {
    guild = await client.guilds.resolve(guildId);
    startCycle();
});
let attempts: number = 0;
function startCycle(){
    const interval = setInterval(async () => {
        attempts++;
        const invite = await createInvite();
        const code = invite.code.split('gg/')[1]?.toLowerCase() ?? invite.code.toLowerCase();
        const response = checkCode(code);
        if(response.success){
            clearInterval(interval);
            console.log(`----------------------------------------------- FOUND!!!!\n${invite.code}`);
        }else{
            console.log(`${attempts}.) ${response.count} ${response.repeat} ${invite}`);
            invite.delete();
        }
    }, 3000);
}
function checkCode(code: string): ICheckingResponse{
    const response: ICheckingResponse = {
        success: false,
        repeat: 0,
        count: 0
    };
    const symbols: any = {};
    for(let i = 0; i < code.length; i++){
        const char: string = code[i];
        if(symbols[char] == undefined)
            symbols[char] = 1;
        else symbols[char]++;
    }
    for(let k in symbols){
        if(symbols[k] > 1)
        {
            response.repeat += symbols[k] - 1;
            response.count++;
        }
    }
    if(code.length <= inviteMaxLength && response.count >= repeatSymbolCount && response.repeat >= repeatEachSymbolCount)
        response.success = true;
    return response;
}
async function createInvite(): Promise<Invite>{
    let newInvite = await guild.invites.create(channelID, {
        maxAge: 0,
        unique: true,
    });
    return newInvite;
}

interface ICheckingResponse{
    success: boolean;
    repeat: number;
    count: number;
}