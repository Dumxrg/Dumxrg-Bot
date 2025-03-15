import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";

function gifToMp4(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!ffmpegStatic) {
            return reject(new Error("FFmpeg binary not found!"));
        }

        // Ensure paths are absolute
        const inputFile = path.resolve(inputPath);
        const outputFile = path.resolve(outputPath);

        // Set FFmpeg binary
        ffmpeg.setFfmpegPath(ffmpegStatic);

        // Convert GIF to MP4 using Fluent FFmpeg
        ffmpeg(inputFile)
            .outputOptions([
                "-movflags faststart",
                "-pix_fmt yuv420p",
                "-vcodec libx264"
            ])
            .toFormat("mp4")
            .save(outputFile)
            .on("end", () => {
                console.log(`✅ Conversion successful: ${outputFile}`);
                resolve();
            })
            .on("error", (err) => {
                console.error("FFmpeg Error:", err);
                reject(err);
            });
    });
}
export default gifToMp4