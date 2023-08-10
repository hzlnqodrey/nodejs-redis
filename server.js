const express = require('express')
const cors = require('cors')
const axios = require('axios')

// REDIS CONFIG
const Redis = require('redis')
const redisClient = Redis.createClient()
redisClient.connect().catch(console.error)
    // if url production: redis://redis-server:6379
    // if not just leave it as is
const DEFAULT_EXPIRATION = 3600 // 1 hour

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.get('/',  async (req, res) => {
    res.send("Hello Redis NodeJS AAAABA")
})

// Cache photos data when the server starts
let cachedPhotos = null;

(async () => {
    try {
        const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos');
        cachedPhotos = data;
    } catch (error) {
        console.error('Error fetching initial photos:', error);
    }
})();

app.get('/photos', async (req, res) => {
    try {
        if (cachedPhotos) {
            console.log('Cache Hit');
            return res.json(cachedPhotos);
        } else {
            console.log('Cache Miss');
            const { data } = await axios.get('https://jsonplaceholder.typicode.com/photos');
            cachedPhotos = data;
            return res.json(data);
        }
    } catch (error) {
        console.error('Error handling /photos:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/photos/:id', async (req, res) => {
    try {
        if (cachedPhotos) {
            const photo = cachedPhotos.find(photo => photo.id.toString() === req.params.id);
            if (photo) {
                console.log('Cache Hit (Individual Photo)');
                return res.json(photo);
            }
        }

        console.log('Cache Miss (Individual Photo)');
        const { data } = await axios.get(`https://jsonplaceholder.typicode.com/photos/${req.params.id}`);
        return res.json(data);
    } catch (error) {
        console.error('Error handling /photos/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000)
})