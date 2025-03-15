import axios from "axios";

const translate = async (text, lang = 'es') => {
    try {
        const response = await axios.get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`
        );
        const translation = response.data;
        return translation[0][0][0];
    } catch (error) {
        console.error("Error translating text:", error.message);
        return text;
    }
};

export default translate;
