import translate from "../lib/translate";

const languageMap = {
  "english": "en",
  "spanish": "es",
  "french": "fr",
  "german": "de",
  "italian": "it",
  "portuguese": "pt",
  "dutch": "nl",
  "russian": "ru",
  "japanese": "ja",
  "chinese": "zh",
  "korean": "ko",
  "arabic": "ar",
  "hindi": "hi",
  "turkish": "tr",
  "greek": "el",
  "swedish": "sv",
  "danish": "da",
  "finnish": "fi",
  "norwegian": "no",
  "polish": "pl",
  "thai": "th",
  "vietnamese": "vi",
  "hebrew": "he",
  "urdu": "ur",
  "bengali": "bn",
  "czech": "cs",
  "hungarian": "hu",
  "romanian": "ro",
  "ukrainian": "uk",
  "malay": "ms",
  "indonesian": "id",
  "filipino": "tl",
  "slovak": "sk",
  "croatian": "hr",
  "serbian": "sr",
  "bulgarian": "bg",
  "slovenian": "sl",
  "estonian": "et",
  "latvian": "lv",
  "lithuanian": "lt"
};

const handler = async (m) => {
  const content = m.body.split(' ').slice(1).join(' ').trim();
  try {
    const words = content.split(' ');
    const langIndex = words.findIndex(word => Object.keys(languageMap).includes(word.toLowerCase()));

    if (langIndex === -1) {
        await m.reply("Sorry, I couldn't find a valid target language.");
        return;
    }

    const lang = languageMap[words[langIndex].toLowerCase()];
    const text = words.slice(langIndex + 1).join(' ');

    if (!text) {
        await m.reply("Please provide some text to translate.");
        return;
    }

    const translatedText = await translate(text, lang);
    await m.reply(`_Translating to ${words[langIndex]}:_\n> ${translatedText}`);
  } catch (error) {
    console.error("Translation error:", error.message);
    await m.reply("Sorry, there was an error translating the message.");
  }
}

handler.command = 'translate';
export default handler;
