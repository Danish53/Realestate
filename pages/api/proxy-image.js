import axios from 'axios';
import sharp from 'sharp';

export default async function handler(req, res) {
    let { url } = req.query;
    if (!url) return res.status(400).send("No URL");

    // Protocol handle karein agar // se shuru ho raha ho
    if (url.startsWith('//')) {
        url = 'https:' + url;
    }

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(response.data);

        // Watermark area ko "Clean" karne ka logic
        const image = sharp(inputBuffer);
        const { width, height } = await image.metadata();

        // Zameen center watermark region
        const region = {
            left: Math.round(width * 0.30),
            top: Math.round(height * 0.35),
            width: Math.round(width * 0.40),
            height: Math.round(height * 0.30)
        };

        const patch = await sharp(inputBuffer)
            .extract(region)
            .blur(25) // Zyada blur watermark ko bilkul gayab kar dega
            .toBuffer();

        const outputBuffer = await image
            .composite([{ input: patch, top: region.top, left: region.left }])
            .jpeg()
            .toBuffer();

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=604800'); 
        return res.send(outputBuffer);
    } catch (error) {
        return res.status(500).send("Proxy error");
    }
}