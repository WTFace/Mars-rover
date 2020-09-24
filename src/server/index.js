require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/manifest/:rover', async (req, res) => {
    try {
        // const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.rover}?api_key=DEMO_KEY`)
        const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
            .then(res => res.photo_manifest)
            
        delete manifest.photos;
        res.send(manifest)
    } catch (err) {
        console.log('error:', err);
    }
})

app.get('/photos/:rover/:sol', async (req, res) => {
    try {
        const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rover}/photos?sol=${req.params.sol}&api_key=${process.env.API_KEY}&page=1`)
            .then(res => res.json())
        
        res.send(photos.photos)
    } catch (err) {
        console.log('error:', err);
    }
})

// example API call
app.get('/apod/:date', async (req, res) => {
    try {
        const dateQuery = req.params.date === 'today' ? '' : `&date=${req.params.date}`;
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}${dateQuery}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))