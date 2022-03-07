
// `got` streamlines Node.js request handling
const got = import('got');

module.exports = async (req, res) => {
  try {
    const { user, size } = req.query;
    const GITHUB_URL = `https://github.com/${user}.png${
      size ? `?size=${size}` : ''
    }`;
    const imageRequest = got(GITHUB_URL);

    // Use the `got` promises to:
    //   1. receive the content type via `imageResponse`
    //   2. receive the buffer via `imageBuffer`
    const [imageResponse, imageBuffer] = await Promise.all([
      imageRequest,
      imageRequest.buffer(),
    ]);

    // Define a caching header to cache the image on the edge
    // FYI: Caching is tricky, and for now, I went with 12h caching time
    // There might be better configurations, but it does the trick for now
    // 
    // Read more: https://vercel.com/docs/concepts/functions/edge-caching
    res.setHeader('Cache-Control', 's-maxage=43200');
    res.setHeader('content-type', imageResponse.headers['content-type']);
    res.send(imageBuffer);
  } catch (error) {
    // Handle thrown 404s
    if (error.message.includes('404')) {
      res.status(404);
      return res.send('Not found');
    }

    // Fail hard if it's not a 404
    res.status(500);
    res.send(error.message);
  }
};