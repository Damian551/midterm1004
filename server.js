const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/songsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// Song Schema
const songSchema = new mongoose.Schema({
    songId: Number,
    artistData: {
        artistId: Number,
        name: String,
        country: String
    },
    releaseDate: String,
    songTitle: String,
    genre: String
});

const Song = mongoose.model('Song', songSchema);

// Initialize database with songs from songs.json
const songs = require('./songs.json');
async function initializeDB() {
    try {
        await Song.deleteMany({});
        await Song.insertMany(songs);
        console.log('Database initialized with songs');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}
initializeDB();

// API Routes
// Get all songs
app.get('/api/songs', async (req, res) => {
    try {
        const songs = await Song.find();
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching songs' });
    }
});

// Get song by ID
app.get('/api/songs/:id', async (req, res) => {
    try {
        const song = await Song.findOne({ songId: parseInt(req.params.id) });
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.json(song);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching song' });
    }
});

// Get songs by artist
app.get('/api/songs/artist/:name', async (req, res) => {
    try {
        const songs = await Song.find({ 'artistData.name': req.params.name });
        if (songs.length === 0) {
            return res.status(404).json({ error: 'No songs found for this artist' });
        }
        res.json(songs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching songs' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});