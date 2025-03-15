const axios = require('axios');
const { MessageMedia } = require('whatsapp-web.js');

const handler = async (m) => {
  const content = m.body.split(' ').slice(1).join(' ').trim();
  try {
      // Verificar que se ha proporcionado contenido
      if (content === ''){
          await m.reply('Por favor, proporciona el texto para convertirlo en un código QR.');
          return;
      }
      // Construir la URL de la API de goqr.me
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(content)}&size=200x200`;

      // Obtener la imagen del código QR
      const response = await axios.get(qrApiUrl, { responseType: 'arraybuffer' });
      const media = new MessageMedia('image/png', Buffer.from(response.data).toString('base64'), 'qrcode.png');

      // Enviar la imagen del código QR
      await m.reply(media, undefined, {
        caption: '¡Aquí está tu código QR!'
    });

  } catch (error) {
      console.error('Error al generar el código QR:', error.message);
      await m.reply('Hubo un error al intentar generar el código QR. Inténtalo de nuevo.');
  }
};

handler.command = 'qr'
export default handler