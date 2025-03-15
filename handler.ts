import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Define the type for each plugin handler

interface Handler {
    (m: any, msg?: any): Promise<void>;  // El handler es una función async que toma 'm' y opcionalmente 'MSG' como argumentos y devuelve una Promise
    command: string;                    // Cada handler debería tener una propiedad 'command'
    tags?: string;
    usage?: string;
    help?: string;
    admin?: boolean;
    botAdmin?: boolean;
    group?: boolean;
    owner?: boolean;
    coins?: number;
    exp?: number;
    register?:boolean
}
interface Group {
    participants: string[];
    botAdmin: boolean;
    isGroup: boolean | null;
    isAdmin: boolean | null;
    mentionedIds: string[];
}

interface Msg {
    preffix: string | null;
    from: string | null;
    command: string | null;
    atributes: string | null;
    owner: boolean;
    group: Group;
}


interface Plugin {
    name: string;
    handler: Handler;
}

const pluginHandlers: Plugin[] = [];  // This array will hold handlers with their names

// Load plugins dynamically from the 'plugins' directory
const loadPlugins = async () => {
    const pluginsPath = path.join(__dirname, 'plugins');  // The path to your plugins directory
    const pluginFiles = fs.readdirSync(pluginsPath);  // Read all files in the plugins folder

    for (const file of pluginFiles) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {  // Load both TypeScript and JavaScript files
            try {
                const plugin = await import(path.join(pluginsPath, file));  // Dynamically import the plugin
                console.log(file + chalk.green(' Has been imported succesfully!'));
                if (plugin.default) {
                    pluginHandlers.push({
                        name: file,   // Store the filename as the plugin name
                        handler: plugin.default
                    });
                }
            } catch (err) {
                console.error(`Error loading plugin ${file}:`, err);
            }
        }
    }
};

// Call the loadPlugins function to load all plugins on startup
loadPlugins().then(() => {
    console.log('\nPlugins loaded:', pluginHandlers.map(p => p.name));  // Log only plugin names
}).catch(err => {
    console.error('Error loading plugins:', err);
});

// Execute the appropriate handler when a message comes in
const executeHandler = async (m: any) => {
    let found: boolean = false
    const chat = await m.getChat()
    const msg: Msg = {
        owner: m.from === "34690742262@c.us",
        from: m.from ?? null,
        preffix: m.body?.split('')[0]?.trim() ?? null,
        command: m.body?.split(' ')[0]?.slice(1).trim() ?? null,
        atributes: m.body?.split(' ').slice(1).join(' ').trim() ?? null,
        group: {
            mentionedIds: m.mentionedIds,
            participants: chat?.participants 
                ? chat.participants.map(participant => participant.id._serialized) 
                : [], // Returns an empty array if chat.participants is undefined
            isGroup: chat?.isGroup ?? null,
            isAdmin: chat?.participants 
                ? chat.participants.some(
                    participantInfo => participantInfo.id._serialized === m.from && participantInfo.isAdmin
                ) 
                : null, // If `chat.participants` is undefined, return `null`
                botAdmin: chat?.participants
                ? chat.participants.some(
                    participant => participant.id._serialized ===  Bot.getNumber() && participant.isAdmin
                )
                : false, 
        }
    };
    
    console.log(msg)
    for (const plugin of pluginHandlers) {
        const { handler, name } = plugin;
        try {
            if (handler && handler.command && m.body.slice(1).startsWith(`${handler.command}`)) {
                console.log(`Executing handler from ` + chalk.green(name));
                await handler(m, msg);
                found = true;
            }
        } catch (err) {
            console.error(`Error in plugin ${name}:`, err);
        }
    }
    if (found === false) {
        m.reply(`El comando\n>${m.body.slice(" ")[0]} no es reconocido.`);
        return;
    }
    else {
        found = false;
        return;
    }
};

export default executeHandler;
