const qrcode = require("qrcode-terminal");
const fs = require("fs");
const sharp = require("sharp");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fetch = require('node-fetch');
let data = ''
let response = ''

let startTime = Date.now();
const allowedGroups = new Set(); // This will hold the IDs of groups where /start was issued


const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "yourFolderName", // Replace with the path to your auth folder
  }),
});

const sendMessageToNumber = async (number, message) => {
  try {
    await client.sendMessage(number, message);
    console.log(`Message sent to ${number}: ${message}`);
  } catch (error) {
    console.error(`Failed to send message to ${number}: ${error.message}`);
  }
};

client.on("qr", (qr) => {
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.once("ready", () => {
  console.log("Client is ready!!");
  sendMessageToNumber("34690742262@c.us", "Ready pal mambo");
  startTime = Date.now(); // Set the start time when the client is ready
});

client.on("authenticated", (session) => {
  console.log("Authenticated successfully!", session);
});

client.on("message_create", async (msg) => {
  if (msg.timestamp * 1000 < startTime) {
    console.log("Ignoring old message:", msg.body);
    return;
  }
  if (msg.fromMe) {
    console.log("Dumxrg:", msg.body);
    handleMessage(msg);
  } else {
    const contact = await msg.getContact();
    const contactName = contact.pushname || contact.number;
    switch (msg.type) {
      case "image":
        console.log(contactName + " sent an image");
        break;
      case "sticker":
        console.log(contactName + " sent a sticker");
        break;
      case "audio":
        console.log(contactName + " sent an audio message");
        break;
      case "video":
        console.log(contactName + " sent a video");
        break;
      default:
        console.log(contactName + " said: " + msg.body);
    }
    handleMessage(msg);
  }
});

const handleMessage = async (msg) => {
  const lowerMsg = msg.body.toLowerCase();
  try {
    if (lowerMsg.includes("frog")) {
      msg.react("🐸");
    }
    if (
      lowerMsg.includes("neko") ||
      lowerMsg.includes("cat") ||
      lowerMsg.includes("gato")
    ) {
      await msg.react("🐱");
    } else if (
      lowerMsg.includes("love") ||
      lowerMsg.includes("amo") ||
      lowerMsg.includes("❤️")
    ) {
      await msg.react("❤️");
    } else if (
      lowerMsg.includes("bot") ||
      lowerMsg.includes("morgan") ||
      lowerMsg.includes("dumxrg")
    ) {
      await msg.react("🤖");
    }

    if (msg.body.startsWith("/")) {
      
      const command = lowerMsg.split(" ")[0];
      const content = msg.body.slice(command.length).trim();
switch (command){
 

case "/joke":
  try {
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        'Accept': 'application/json'
      }
    });
    const data = await response.json();
    msg.reply(data.joke);
  } catch (error) {
    console.error("Error fetching joke:", error.message);
    msg.reply("Hubo un error al obtener la broma.");
  }
  break;

        case "/kanye":
          const url = "https://api.kanye.rest/";
          try {
            response = await fetch(url);
           data = await response.json();
            await msg.reply("Random Kanye Quote:\n\n_'" + data.quote + "'_  🐻");
            msg.react('🐻')
          } catch (error) {
            console.error("Error fetching Kanye quote:", error.message);
            await msg.reply("Hubo un error al obtener la cita de Kanye.");
            msg.react('🐻')
          }
          break;

        case "/ping":
          try {
            const start = Date.now();
            await msg.reply("pong!");
            const end = Date.now();
            const timeTaken = end - start;
            await msg.reply(`Response time: ${timeTaken} ms`);
          } catch (error) {
            console.error("Error handling /ping command:", error.message);
          }
          break;

        case "/dice":
          try {
            const faces = Math.abs(parseInt(content));
            if (!isNaN(faces) && faces > 0) {
              let dice = Math.floor(Math.random() * faces) + 1;
              await msg.reply(
                "El dado de " +
                  faces +
                  " caras ha girado...\n\n¡Ha salido " +
                  dice +
                  "!"
              );
            } else {
              const diceIcons = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
              let dice = Math.floor(Math.random() * 6) + 1;
              await msg.reply(
                "El dado de 6 caras ha girado...\n\n¡Ha salido " +
                  dice +
                  "!\n" +
                  diceIcons[dice]
              );
            }
          } catch (error) {
            console.error("Error handling /dice command:", error.message);
            await msg.reply("Hubo un error al procesar tu solicitud.");
          }
          break;

        case "/menu":
          try {
            const now = Date.now();
            const runtime = now - startTime; // Calcular el tiempo de ejecución en milisegundos
            const hours = Math.floor(runtime / (1000 * 60 * 60));
            const minutes = Math.floor(
              (runtime % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((runtime % (1000 * 60)) / 1000);
            const milliseconds = runtime % 1000;
            const runtimeStr = `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`;
            await msg.reply(
              `*_DUMXRG-BOT-BETA_*\n> Running for: ${runtimeStr}\nMADE IN SPAIN🇪🇸 \nCommand List:\n> /menu\n> /say + (texto)\n> /ping\n> /dice (numero)\n> /s (responde a una imagen)\n> /kanye (random kanye quote)\n> /joke`
            );
          } catch (error) {
            console.error("Error handling /menu command:", error.message);
          }
          break;

        case "/say":
          try {
            if (content) {
              await msg.reply(content);
            } else {
              await msg.reply(
                "Por favor, proporciona un mensaje después de /say."
              );
            }
          } catch (error) {
            console.error("Error handling /say command:", error.message);
            ``;
          }
          break;
        case "/s":
        case "/sticker":
          try {
            if (msg.hasMedia) {
              const media = await msg.downloadMedia();
              if (
                media &&
                (media.mimetype.startsWith("image") ||
                  media.mimetype.startsWith("gif"))
              ) {
                // Add metadata for author and description
                await client.sendMessage(msg.from, media, {
                  sendMediaAsSticker: true,
                  stickerAuthor: "★Dumxrg★",
                  stickerName:
                    "Sticker created with the command /s\nUsing - Dumxrg bot",
                });
              } else {
                await msg.reply(
                  "La media recibida no es una imagen ni un gif."
                );
              }
            } else {
              const quotedMsg = await msg.getQuotedMessage();
              if (
                quotedMsg &&
                quotedMsg.hasMedia &&
                (quotedMsg.type === "image" || quotedMsg.type === "gif")
              ) {
                const media = await quotedMsg.downloadMedia();
                if (media) {
                  // Add metadata for author and description
                  await msg.reply(media, {
                    sendMediaAsSticker: true,
                    stickerAuthor: "\n\n\n★Dumxrg★",
                    stickerName:
                      "Sticker created with the command /s\nUsing - Dumxrg bot",
                  });
                } else {
                  await msg.reply(
                    "No se pudo descargar el contenido multimedia."
                  );
                }
              } else {
                await msg.reply(
                  "Por favor, responde o envía una imagen o gif con /s."
                );
              }
            }
          } catch (error) {
            console.error("Error handling /s command:", error.message);
            await msg.reply("Hubo un error al procesar tu solicitud.");
          }
          break;

        default:
          try {
            await msg.reply(
              `Lo siento... Pero el comando\n> _${command}_\nNo existe`
            );
          } catch (error) {
            console.error("Error handling unknown command:", error.message);
          }
          break;
      }
    } else {
      return;
    }
  } catch (error) {
    console.log("Error processing message:", error.message);
  }
};

client.initialize();
