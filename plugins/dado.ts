const handler = async (m)=>{
    const content = m.body.split(' ').slice(1).join(' ').trim();
    const rawCommand = m.body.slice(1).split(' ')[0
        
    ]
    try {
      m.reply(` ${Math.floor(Math.random()*6)+1}`)
    } catch (error) {
        console.error("Whoopsie", error.message);
        await m.reply("Whoopsie! An error has ocurred");
    }
}
handler.command = 'dado';
export default handler