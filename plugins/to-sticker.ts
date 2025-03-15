import { MessageMedia } from 'whatsapp-web.js';
import path from 'path';
import fs from 'fs';
import gifToMp4 from '../lib/toMp4';  // Assuming gifToMp4 is in lib folder
import botSettings from '../script';

// The main handler for the sticker command
const handler = async (msg) => {
    try {
        // Check if the message has media or is a reply with media
        if (msg.hasMedia || (msg.hasQuotedMsg && (await msg.getQuotedMessage()).hasMedia)) {
            // Download the media, either from the message or the quoted message
            const media = msg.hasMedia ? await msg.downloadMedia() : await (await msg.getQuotedMessage()).downloadMedia();
            console.log(media.mimetype);  // Check the MIME type of the media

            // Check if the media is a GIF
            const isGif = media.mimetype === 'image/gif';  // Must be 'image/gif' for GIFs
            console.log(isGif ? "GIF detected" : "Not a GIF");

            if (!isGif) {
                // If not a GIF, send it directly as a sticker
                await msg.reply(media, undefined, {
                    sendMediaAsSticker: true,
                    stickerAuthor: "★Dumxrg★",
                    stickerName: `Sticker created with the /s command\nCreated by - ${botSettings.botName}`,
                });
            } else {
                try {
                    // Paths for temporary GIF and MP4 files
                    const gifPath = path.join(__dirname, 'temp', 'temp.gif');
                    const mp4Path = path.join(__dirname, 'temp', 'temp.mp4');

                    // Write the GIF data to a file
                    fs.writeFileSync(gifPath, media.data);

                    // Convert GIF to MP4 using gifToMp4 function
                    await gifToMp4(gifPath, mp4Path);

                    // Read the converted MP4 as a MessageMedia object
                    const videoMedia = MessageMedia.fromFilePath(mp4Path);

                    // Send the MP4 as a sticker (or video if needed)
                    await msg.reply(videoMedia, undefined, {
                        sendMediaAsSticker: true,
                        sendAsGif: true,
                        stickerAuthor: "★Dumxrg★",
                        stickerName: `Sticker created with the /s command\nCreated by - ${botSettings.botName}`,
                    });

                    // Clean up the temporary files
                    fs.unlinkSync(gifPath);
                    fs.unlinkSync(mp4Path);
                } catch (err) {
                    console.error('Failed to convert the GIF:', err);
                    await msg.reply("There was an error converting the GIF. Please try again.");
                }
            }
        } else {
            // If no media is found, prompt the user to reply to a media message
            await msg.reply("Please reply to a GIF or image with /s to create a sticker.");
        }
    } catch (error) {
        console.error("Error handling /s command:", error.message);
        await msg.reply("An error occurred while processing your sticker request.");
    }
};

// Set the command for the handler
handler.command = 's';
export default handler;
