const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const capitalizeFirstLetter = (a) => {
    return String(a).charAt(0).toUpperCase() + String(a).slice(1);
};

const handler = async (msg) => {
    try {
        // Obtener el mensaje sin la primera palabra
        const tags = msg.body.split(' ').slice(1).join(' ').trim();
        
        if (!tags) {
            return msg.reply('Debes proporcionar al menos una etiqueta.');
        }

        // URL de la API de Rule34
        const apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(tags)}&json=1`;

        // Realizar la solicitud a la API
        const { data } = await axios.get(apiUrl);

        // Verificar si hay posts disponibles
        if (!data || !Array.isArray(data) || data.length === 0) {
            return msg.reply('No se encontraron publicaciones con esa etiqueta.');
        }

        // Elegir un post aleatorio
        const randomPost = data[Math.floor(Math.random() * data.length)];
        
        if (!randomPost.file_url) {
            return msg.reply('No se encontró un URL de imagen para este post.');
        }
        
        // Obtener la URL completa del archivo de imagen
        const imageUrl = randomPost.file_url;
        
        // Filtrar contenido explícito (opcional)
        // if (randomPost.rating === 'explicit') {
        //     return msg.reply('No puedo enviar contenido explícito.');
        // }
        
        // Crear un objeto MessageMedia desde la URL de la imagen
        const media = await MessageMedia.fromUrl(imageUrl);
        
        // Enviar la imagen con información
        await msg.reply(media, undefined, { 
            caption: `*¡Aquí está tu imagen!🖼️📸*

• 🔗 Link: ${imageUrl}
• 👤 Creador: ${randomPost.owner || 'Desconocido'}
• 🔞 Clasificación: ${capitalizeFirstLetter(randomPost.rating)}
• ⭐ Puntuación: ${randomPost.score || 'N/A'}
• 🔗 Fuente: ${randomPost.source || 'No disponible'}
• 🏷️ Tags: _${(randomPost.tags || 'No tags').replace(/_/g, '＿')}_`
        });
        
    } catch (error) {
        console.error('Error fetching image from Rule34:', error.response ? error.response.data : error.message);
        await msg.reply('Hubo un error al obtener una imagen de Rule34.');
    }
};

handler.command = 'r34';
handler.usage = '/r34 (r34-tag/tags)'

export default handler;
