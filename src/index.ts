require('dotenv').config();




const token: string = process.env.TOKEN ?? "<TOKEN>>";
const guildId: string = process.env.GUILD ?? "<GuildID>>";
const channelID: string = process.env.CHANNEL ?? "<ChannelID>>";
const repeatSymbolCount: number = 1;
const repeatEachSymbolCount: number = 4;
const needInvites: number = 999;
const needSaveFancyInvite: boolean = true;
const totalRepeat: number = 5;



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
let dontDelete: number = 0;
let betters: number = 0;
const keys: string[] = [];
function startCycle(){
    const interval = setInterval(async () => {
        const invite = await createInvite();
        const code = invite.code.split('gg/')[1] ?? invite.code;
        const lower = code.toLowerCase();
        const response = checkCode(lower);
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
            console.log(`${attempts}.) ${response.diagnostic.count} ${response.diagnostic.repeat} ${code} ${founds} ${betters} ${dontDelete}`);
            if(response.diagnostic.dontDelete && needSaveFancyInvite){
                dontDelete++;
            }else if(response.diagnostic.better){
                betters++;
            }else{
                invite.delete();
            }

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
            count: 0,
            dontDelete: false,
            better: false
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
            response.diagnostic.repeat += symbols[k];
            response.diagnostic.count++;
        }
        if(symbols[k] >= repeatEachSymbolCount)
        {
            response.repeat += symbols[k];
            response.count++;
        }
    }
    if(response.diagnostic.repeat >= 4 && response.diagnostic.count >= 2){
        const strings: string[] = [];
        for(let k in symbols){
            if(symbols[k] > 1){
                let str: string = "";
                for(let i = 0; i < symbols[k]; i++){
                    str += k;
                }
                strings.push(str);
            }
        }

        if(response.diagnostic.count == 2){
            if(code.includes(`${strings[0]}${strings[1]}`) || code.includes(`${strings[1]}${strings[0]}`))
                response.diagnostic.dontDelete = true;
        }else if(response.diagnostic.count == 3) {
            if (code.includes(`${strings[0]}${strings[1]}${strings[2]}`) ||
                code.includes(`${strings[2]}${strings[1]}${strings[0]}`) ||
                code.includes(`${strings[1]}${strings[0]}${strings[2]}`) ||
                code.includes(`${strings[2]}${strings[0]}${strings[1]}`))
                response.diagnostic.dontDelete = true;
        }

    }
    if(totalRepeat > 0 && response.diagnostic.repeat >= totalRepeat)
        response.diagnostic.better = true;
    if(response.count >= repeatSymbolCount)
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
    dontDelete: boolean;
    better: boolean;
}



