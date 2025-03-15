import axios from "axios";

const handler = async (m)=>{
    const url = "https://api.kanye.rest/";
    try {
        const response = await axios.get(url);
        const data = response.data;
        await m.reply(`Random Kanye Quote:\n\n_${data.quote}_ 🐻`);
        return m.react("🐻");
    } catch (error) {
        console.error("Error fetching Kanye quote:", error.message);
        await m.reply("Hubo un error al obtener la cita de Kanye.");
    }
}
handler.command = 'kanye-quote';
handler.usage = '/kanye-quote'
export default handler