require('dotenv').config();




const token: string = process.env.TOKEN ?? "<TOKEN>>";
const guildId: string = process.env.GUILD ?? "<GuildID>>";
const channelID: string = process.env.CHANNEL ?? "<ChannelID>>";
const inviteMaxLength: number = 10;
const repeatSymbolCount: number = 1;
const repeatEachSymbolCount: number = 4;
const needInvites: number = 999;





let guild: Guild;

import {Client, Guild, Invite} from "discord.js";
const client: Client = new Client({intents: ["GUILD_INVITES"]});
client.login(token);
client.on(`ready`, async () => {
    guild = await client.guilds.resolve(guildId);
    startCycle();
});
let attempts: number = 0;
let founds: number = 0;
const keys: string[] = [];
function startCycle(){
    const interval = setInterval(async () => {
        const invite = await createInvite();
        const code = invite.code.split('gg/')[1]?.toLowerCase() ?? invite.code.toLowerCase();
        const response = checkCode(code);
        attempts++;
        if(response.success){
            clearInterval(interval);
            keys.push(code);
            founds++;
            attempts = 0;
            console.log(`----------------------------------------------- FOUND!!!!\n${invite.code}`);
            if(founds >= needInvites){
                console.log("Exit >>",
                    keys);
            }else
                startCycle();
        }else{
            console.log(`${attempts}.) ${response.diagnostic.count} ${response.diagnostic.repeat} ${invite} ${founds}`);
            invite.delete();
        }
    }, 4000);
}
function checkCode(code: string): ICheckingResponse{
    const response: ICheckingResponse = {
        success: false,
        repeat: 0,
        count: 0,
        diagnostic: {
            repeat: 0,
            count: 0
        }
    };
    const symbols: any = {};
    for(let i = 0; i < code.length; i++){
        const char: string = code[i];
        if(symbols[char] == undefined)
            symbols[char] = 1;
        else symbols[char]++;
    }
    for(let k in symbols){
        if(symbols[k] > 1){
            response.diagnostic.repeat += symbols[k] -1;
            response.diagnostic.count++;
        }
        if(symbols[k] >= repeatEachSymbolCount)
        {
            response.repeat += symbols[k];
            response.count++;
        }
    }
    if(code.length <= inviteMaxLength && response.count >= repeatSymbolCount)
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
    diagnostic: IDiagnosticInformation;
}
interface IDiagnosticInformation{
    repeat: number;
    count: number;
}