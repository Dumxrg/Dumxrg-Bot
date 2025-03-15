const { MessageMedia } = require('whatsapp-web.js')
import fs from 'fs'
import path from 'path'
const directoryPath = path.join(__dirname, './assets/menu')
const handler = async (m) =>{

    try{
        const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.png') || file.endsWith('.jpg'))
        if(files.length===0){
            throw new Error('No images have been found in assets/menu')
                }
        else{
         
        const media = await MessageMedia.fromFilePath(files[Math.floor(Math.random()*files.length)])
        m.reply(media, undefined, {
            caption:'MENU'
        })   
        }

    }
    catch(err){
        console.error('a',err

        )
    }
}
handler.command = 'menu'
export default handler