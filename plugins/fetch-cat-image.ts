import axios from "axios";
const { MessageMedia } = require('whatsapp-web.js')
const handler = async (m) => {
    try {
        // Randomly choose between the two APIs
        const useCataas:boolean = Math.random() > 0.5;

        let imageUrl:string;
        if (useCataas) {
            imageUrl = "https://cataas.com/cat";
        } else {
            const response = await axios.get("https://api.thecatapi.com/v1/images/search");
            imageUrl = response.data[0].url;
        }

        const media:JSON = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });

        await m.reply(media, undefined, {
            caption: `🐱 Aquí tienes una imagen aleatoria de gato.\nFuente: ${useCataas ? 'https://cataas.com/' : 'https://thecatapi.com/'}`
        });
    } catch (error) {
        console.error("Error fetching random cat image:", error.message);
        await m.reply("Hubo un error al obtener una imagen aleatoria de gato.");
    }
};

handler.command = 'cat';
export default handler