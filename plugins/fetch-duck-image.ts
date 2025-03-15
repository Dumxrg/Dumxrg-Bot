import axios from 'axios';
const { MessageMedia } = require('whatsapp-web.js')

const handler = async (m) => {
    try {
        const response = await axios.get("https://random-d.uk/api/v2/quack");
        const imageUrl = response.data.url;  // URL de la imagen
        const media:string = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });

        await m.reply(media, undefined, {
            caption: "🦆 Aquí tienes una imagen aleatoria de pato.\nFuente: https://random-d.uk/"
        });
    } catch (error) {
        console.error('Error fetching image from Random Duck API:', error.response ? error.response.data : error.message);
        await m.reply("Hubo un error al obtener una imagen aleatoria de pato.");
    }
};


handler.command='duck'
handler.usage='/duck'
export default handler;
