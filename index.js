import fetch from 'node-fetch'
import Discord from 'Discord.js'
import dotenv from "dotenv"

dotenv.config()

const nameList = [
    "Antonfuarr",
    "Spade",
    "Reyrai",
    "DragonzXslayer",
    "Lncognito",
    "Impede",
    "Shelter",
    "Channsenpaii",
    "L Anxiety L",
    "Lil Vayne",
    "Riven Bot"]

async function getSummonerName() {
 
    let encryptedSummonerIdList = []

    for (var IGN of nameList) {
        const summonerURL = 'https://oc1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + IGN

        const headers = {
            "X-Riot-Token": process.env.RIOT_API_KEY,
            method: 'GET'
        };

        const response = await fetch(summonerURL, { method: 'GET', headers: headers})
        const data = await response.json();  

        encryptedSummonerIdList.push(data["id"])
    }
    return encryptedSummonerIdList
}

async function getSummonerEntry(encryptedList) {

    let summonerInformationList = []

    const QUEUE_TYPE = 'RANKED_SOLO_5x5';

    for (var encryptedId of encryptedList) {
        const summonerURL = 'https://oc1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + encryptedId

        const headers = {
            "X-Riot-Token": process.env.RIOT_API_KEY,
            method: 'GET'
        };

        const response = await fetch(summonerURL, { method: 'GET', headers: headers})
        const data = await response.json();  
        if (data.length > 0) {
            var extracted = data[0]

            if (extracted['queueType'] == QUEUE_TYPE) {
                var augmentedList = {
                    summonerName: extracted['summonerName'],
                    rank: extracted['tier'] + " " +  extracted['rank'] + " " + extracted['leaguePoints'] + "LP",
                    wins: extracted['wins'],
                    losses: extracted['losses'],
                }
                summonerInformationList.push(augmentedList)
            }
        }
    }
    return summonerInformationList
}
const encryptedList = await getSummonerName();

var values = await getSummonerEntry(encryptedList)

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_CLIENT_TOKEN); 

client.on('message', msg => {
    if (msg.content === '/srrank') {
      msg.reply(JSON.stringify(values, null, "\t"));
    }
});