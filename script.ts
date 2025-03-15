const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
import chalk from "chalk";
import executeHandler from "./handler";
const os = require('os');
const fs = require('fs').promises;
const path = require('path')
const cmdSafeRegex: RegExp = /[^ -~\t\n]/g;
const allSymbolsRegex = /[^\x20-\x7E\xA0-\xFF\u2000-\u206F\u2B50\u2700-\u27BF]/g;

const messageTypes = [  //NOT IN USAGE, JUST TO SHOW AVAILABLE MESSAGE TYPES
    'chat',       // Normal txt
    'ppt',        // Voice Messages
    'sticker',
    'image',
    'video',
    'location',
    'poll_creation',
    'document',
    'vcard'       // Contact cards
];
let executablePath = ''; // Inicializar con una cadena vacía

if (os.platform() === 'win32') {
    executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
} else if (os.platform() === 'linux') {
    executablePath = "/usr/bin/google-chrome";
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: executablePath,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--remote-debugging-port=9222',
        ],
        timeout: 120000
    }
});
declare global {
    namespace Bot {
        let number: string | null;
        function setNumber(num: string): void;
        function getNumber(): string | null;
    }
}

// Define the namespace implementation
globalThis.Bot = {
    number: null,

    setNumber(num: string) {
        globalThis.Bot.number = num;
    },

    getNumber() {
        return globalThis.Bot.number;
    }
};

interface CommandSettings {
    commandPrefixes: string[]; // Command prefixes 
}
interface Content{
    content:string;
    mentionedIds:string;
}

interface ConsoleClearSettings {
    enabled: boolean;   // Whether to enable auto-clearing of the console

    threshold: number;  // Number of messages before the console is cleared
}

interface WriteConsoleOutputInTxt {
    enabled: boolean;   // Whether to log messages to a text file 
    path: string;       // Path where the log file will be saved
    writePhoneNumber: boolean; // Wether to write the phone number of the author of a message || Note, this setting is independant from the MessageLoggingSetting
}

interface MessageLoggingSettings {
    displayInConsole: boolean;  // Whether to show messages in the console
    displayHour: boolean;
    dispayPhoneNumber: boolean; // Wether to show the phone number next to the number
    availableCharacters: RegExp;
    displayOnlyCommands: boolean; // Only display commands, ignorinng everything else
    maxChar: number;            // Maximun charcters to replace the output with "Sent a long message"
    prefix: string;             // The character(s) that appear before the contact name
    messageTypesToLog: string[]; // List of message types to log  || Note: (USE THE ONES THAT ARE IN THE CONST messageTypes)
    displayContactName: boolean; // Whether to display the contact's name in the log
    suffix: string;             // The character(s) that appear after the contact name
}

interface MessageSettings {
    consoleClearSettings: ConsoleClearSettings;
    writeConsoleOutputInTxt: WriteConsoleOutputInTxt;
    messageLoggingSettings: MessageLoggingSettings;
}

interface BotSettings {
    botName: string;       // Bot's name
    botVersion: string;    // Bot's version
    messageSettings: MessageSettings; // Settings related to message logging and console output
    commandSettings: CommandSettings; // Settings related to command handling
}

const botSettings: BotSettings = {
    botName: 'Dumxrg-Bot',
    botVersion: '0.01',
    messageSettings: {
        messageLoggingSettings: {
            availableCharacters: cmdSafeRegex, // If you are using a terminal compatible with emojis and stuff like that use allSymbolsRegex
            displayInConsole: true,
            dispayPhoneNumber: false,
            displayHour: true,
            displayOnlyCommands: false, // Note, if this is true, it will show exclusively messages that start with the preffixes set in commandSettings
            maxChar: 100,
            prefix: '>',
            messageTypesToLog: ['chat', 'sticker','image'],
            displayContactName: true,
            suffix: ':',
        },
        consoleClearSettings: {
            enabled: true,
            threshold: 50,  // Clear the console after this many messages
        },
        writeConsoleOutputInTxt: {
            enabled: true,
            path: 'file.txt',
            writePhoneNumber: true,
        },
    },
    commandSettings: {
        commandPrefixes: ['!', '/'],
    },
};

client.on('loading_screen', (percent, message) => {
    console.clear();
    const totalBlocks: number = 30;
    const filledBlocks: number = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks: number = totalBlocks - filledBlocks;
    const progress: string = `${chalk.green('■').repeat(filledBlocks)}${chalk.gray('■').repeat(emptyBlocks)}`;
    console.log(`-->>                     ${botSettings.botName} V ${botSettings.botVersion}                 <<--`);
    console.log('---------------------------------------------------------------');
    console.log(chalk.magentaBright(`Loading Screen... [${progress}] ${percent}% ${message}`));
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', async () => {
    let date = new Date()
    Bot.setNumber(client.info.wid._serialized);

    console.log(chalk.greenBright('\nLoading Complete! Client is ready!'));
if(botSettings.messageSettings.writeConsoleOutputInTxt.enabled){ 
   await  fs.appendFile(botSettings.messageSettings.writeConsoleOutputInTxt.path,
    `\n-------------------------------------------\n\n|      BOT STARTED AT ${await date.getMonth()}/${await date.getDay()}/${await date.getFullYear()} ${await date.getHours()}:${await date.getMinutes()}      |\n\n-------------------------------------------\n`   )};
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

let msgCounter = 0;
let totalMessages = 0;
const initialTimestamp: number = new Date().getTime();
const hourAndMinutes = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};
client.on('message_create', async (m) => {
    const contact = await m.getContact();
    const contactName = botSettings.messageSettings.messageLoggingSettings.displayContactName ? (contact.pushname || contact.number) : '';
    const contactPhone = botSettings.messageSettings.messageLoggingSettings.dispayPhoneNumber ? '+' + (contact.number) + ' ' : '';
    const contactPhoneTxt = botSettings.messageSettings.writeConsoleOutputInTxt.writePhoneNumber ? '+' + (contact.number) + ' ' : '';

    // Ignore messages received before the client started
    if (m.timestamp * 1000 < initialTimestamp) return;

    // Check if the message type is in the list of logged message types
    if (botSettings.messageSettings.messageLoggingSettings.messageTypesToLog
        .map(type => type.toLowerCase()).includes(m.type.toLowerCase())
        && botSettings.messageSettings.messageLoggingSettings.displayInConsole) {

        msgCounter++;

        // Clear console after the threshold is reached
        if (msgCounter >= botSettings.messageSettings.consoleClearSettings.threshold && botSettings.messageSettings.consoleClearSettings.enabled) {
            console.clear();
            totalMessages += msgCounter;
            console.log(`-->>                     ${botSettings.botName} V ${botSettings.botVersion}                 <<--`);
            console.log('---------------------------------------------------------------');
            console.log(chalk.bgYellow(`Console cleared after exceeding ${botSettings.messageSettings.consoleClearSettings.threshold} messages!\nTotal messages: ${totalMessages}`));
            msgCounter = 0;
        }

        let logMessage = '';
        let hour = botSettings.messageSettings.messageLoggingSettings.displayHour ? `   - ${hourAndMinutes()}` : '';

        // If the message is of type "chat"
        // Don't mind the madness below
        if (m.type === 'chat' && botSettings.commandSettings.commandPrefixes.some(prefix => m.body.startsWith(prefix))) {
            executeHandler(m);  // Call the handler function here
        }

        if ((m.type === 'chat' && botSettings.messageSettings.messageLoggingSettings.displayOnlyCommands === false) || (m.type === 'chat' && botSettings.commandSettings.commandPrefixes.some(prefix => m.body.startsWith(prefix)))) {
         
            const safeContactName = contactName ? contactName.replace(botSettings.messageSettings.messageLoggingSettings.availableCharacters, '') : 'Unknown';

            if (m.body.length > botSettings.messageSettings.messageLoggingSettings.maxChar) {
                logMessage = `${contactPhoneTxt}${botSettings.messageSettings.messageLoggingSettings.prefix} ${safeContactName}${botSettings.messageSettings.messageLoggingSettings.suffix} sent a long message!${hour}\n`;
                console.log(contactPhone + chalk.bgCyan(`${botSettings.messageSettings.messageLoggingSettings.prefix} ${safeContactName}${botSettings.messageSettings.messageLoggingSettings.suffix}`) + ` sent a long message!${hour}`);
            } else {
                logMessage = `${contactPhoneTxt}${botSettings.messageSettings.messageLoggingSettings.prefix} ${safeContactName}${botSettings.messageSettings.messageLoggingSettings.suffix} ${m.body}${hour}\n`;
                console.log(contactPhone + chalk.bgCyan(`${botSettings.messageSettings.messageLoggingSettings.prefix} ${safeContactName}${botSettings.messageSettings.messageLoggingSettings.suffix}`) +
                    chalk.cyanBright(` ${m.body.replace(botSettings.messageSettings.messageLoggingSettings.availableCharacters, '')}`) + `${hour}`);
            }

            // Write to file if enabled
            if (botSettings.messageSettings.writeConsoleOutputInTxt.enabled) {
                try {
                    await fs.appendFile(botSettings.messageSettings.writeConsoleOutputInTxt.path, logMessage);
                } catch (err) {
                    console.error('Error writing to file:', err);
                }
            }
        } else if (botSettings.messageSettings.messageLoggingSettings.displayOnlyCommands === false) {
            // If the message type is not "chat"
            const safeContactName = contactName ? contactName.replace(botSettings.messageSettings.messageLoggingSettings.availableCharacters, '') : 'Unknown';
            logMessage = `${contactPhoneTxt}${botSettings.messageSettings.messageLoggingSettings.prefix} ${safeContactName}${botSettings.messageSettings.messageLoggingSettings.suffix} sent a/an ${m.type}!${hour}\n`;
            console.log(contactPhone + chalk.bgCyan(`${botSettings.messageSettings.messageLoggingSettings.prefix} ${safeContactName}${botSettings.messageSettings.messageLoggingSettings.suffix}`) + ` sent a/an ${m.type}!${hour}`);

            // Write to file if enabled
            if (botSettings.messageSettings.writeConsoleOutputInTxt.enabled) {
                try {
                    await fs.appendFile(botSettings.messageSettings.writeConsoleOutputInTxt.path, logMessage);
                } catch (err) {
                    console.error('Error writing to file:', err);
                }
            }
        }
    }
});
export default botSettings;


console.clear();
client.initialize();