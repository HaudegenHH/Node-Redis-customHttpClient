const express = require('express')
const axios = require('axios')
const cors = require('cors')

const Redis = require("ioredis")
const redisClient = new Redis()
const DEFAULT_EXPIRATION = 3600

const app = express()
app.use(express.urlencoded({ extended: true })) 
app.use(cors())



// cache middleware
const cache = async (req, res, next) => {  
  redisClient.get("photos", async (err, photos) => {
    if(err) {
      console.log(err)
    }
    if(photos !== null){
      return res.json(JSON.parse(photos))
    } else {
      next()
    }
  })
}

// Request data to jsonplaceholder
const getPhotos = async (req, res) => {  
  try {
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos")
    redisClient.set("photos", JSON.stringify(data), "EX", DEFAULT_EXPIRATION)
    return res.json(data)
  } catch (error) {
    console.log(error)
    res.status(404) 
  }
}



app.get("/photos", cache, getPhotos) 


// without caching
app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  )

  res.json(data)
})



app.listen(3000)
