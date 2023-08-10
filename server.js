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
    res.send("Hello Redis NodeJS AAAAB")
})

app.get('/photos', async (req, res) => {
    const albumId = req.query.albumId;
    
    try {
        const { data } = await axios.get(
            `https://jsonplaceholder.typicode.com/photos`,
            { params: { albumId } }
        );

        try {
            await redisClient.setEx('photos', DEFAULT_EXPIRATION, JSON.stringify(data));
            res.json(data);
        } catch (redisError) {
            console.error('Error in Redis setEx:', redisError);
            res.status(500).json({ error: 'Internal server error' });
        }
    } catch (axiosError) {
        console.error('Error in axios get:', axiosError);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/photos/:id', async (req, res) => {
    const albumId = req.query.albumId;
    
    try {
        const { data } = await axios.get(
            `https://jsonplaceholder.typicode.com/photos`,
            { params: { albumId } }
        );

        // Wrap the Redis operation in a try-catch block
        try {
            await redisClient.setEx('photos', DEFAULT_EXPIRATION, JSON.stringify(data));
        } catch (redisError) {
            console.error('Error in Redis setEx:', redisError);
        }

        res.json(data);
    } catch (axiosError) {
        console.error('Error in axios get:', axiosError);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(3000, () => {
    console.log('Server listening on port: ', 3000)
})