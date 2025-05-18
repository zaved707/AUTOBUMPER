// I love you
// this program bumps every 2-2.5 hrs and also has a listener for manual bumps
require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const client = new Client();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const channel = await client.channels.fetch(process.env.BUMP_CHANNEL);
    console.log('BUMP_CHANNEL fetched successfully');
    const disc = await client.channels.fetch(process.env.DISC_CHANNEL);
    console.log('DISC_CHANNEL fetched successfully');

    function isAllowedTime() {
        // Get current time in Indian timezone
        const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const hour = new Date(indiaTime).getHours();

        // Return true if time is between 5 AM and 11:59 PM
        return hour >= 4;
    }

    function calculateDelayUntilRandomTimeBetween5And530AM() {
        const now = new Date();
        // Convert current time to IST
        const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

        // Set target time to 5:00 AM IST
        const target = new Date(indiaTime);
        target.setHours(5, 0, 0, 0);

        // Move target to the next day if the current time is past 5:30 AM IST
        if (indiaTime.getHours() > 5 || (indiaTime.getHours() === 5 && indiaTime.getMinutes() > 30)) {
            target.setDate(target.getDate() + 1);
        }

        // Add random delay between 0 and 30 minutes
        const randomDelayMinutes = Math.floor(Math.random() * 31);
        target.setMinutes(target.getMinutes() + randomDelayMinutes);

        // Calculate delay in milliseconds
        return target.getTime() - indiaTime.getTime();
    }

    async function bump() {
        try {
            await channel.sendSlash('302050872383242240', 'bump');
            const indiaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
            console.log(`Bumped at: ${indiaTime}`);
            console.count('Bumped!');
            
            // Wait for a random time between 10-20 seconds before bumping in disc channel
            // const randomDelay = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
            // await new Promise(resolve => setTimeout(resolve, randomDelay));
            
            // await disc.sendSlash('1222548162741538938', 'bump');
            // console.log(`Bumped in disc channel at: ${indiaTime}`);

            // const randomDelay2 = Math.floor(Math.random() * (20000 - 10000 + 1)) + 10000;
            // await new Promise(resolve => setTimeout(resolve, randomDelay2));
            
            // await disc.sendSlash('826100334534328340', 'bump');
            // console.log(`Bumped in hbbump channel at: ${indiaTime}`);
            
        } catch (error) {
            console.error('Error sending bump command:', error);
        }
    }

    let timeout;

    function loop() {
        // Random delay between 2 hours and 2.5 hours
        const randomNum = Math.floor(Math.random() * (9000000 - 7200000 + 1)) + 7200000;
        
        const nextBumpTime = new Date(Date.now() + randomNum).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        console.log(`Next bump scheduled at: ${nextBumpTime}`);

        timeout = setTimeout(async function () {
            if (isAllowedTime()) {
                await bump();
            } else {
                console.log('Skipping bump - outside allowed hours');
            }
            loop();
        }, randomNum);
    }

    rl.on('line', async (input) => {
        if (input.trim().toLowerCase() === 'r') {
            console.log('Manual bump triggered');
            clearTimeout(timeout);
            await bump();
            loop();
        }
    });

    // Start the bot
    if (isAllowedTime()) {
        console.log("Within allowed time. Executing first bump immediately.");
        await bump();
        loop();
    } else {
        const delay = calculateDelayUntilRandomTimeBetween5And530AM();
        const nextBumpTime = new Date(Date.now() + delay).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        console.log(`Waiting ${(delay / 1000 / 60).toFixed(2)} minutes until a random time between 5 and 5:30 AM IST to start. Next bump scheduled at: ${nextBumpTime} \n Press R for manual bump`);
        setTimeout(async () => {
            await bump();
            loop();
        }, delay);
    }
});

client.login(process.env.TOKEN);
