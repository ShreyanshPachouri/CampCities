const mongoose = require('mongoose')
const Campground = require("../models/campground")
const cities = require('./cities')
const axios = require('axios')
const {places, descriptors} = require('./seedHelpers')

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("Database connected")
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async() => {
    await Campground.deleteMany({})

    async function seedImg() {
        try {
          const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
              client_id: 'odnnnpFzQJPjpvzaLT1-5OlgmjrhsFiBqtYB0WF-Rrk',
              collections: 1114848,
            },
          })
          return resp.data.urls.small
        } catch (err) {
          console.error(err)
        }
      }

    for(let i = 0; i < 50; i ++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author :'66807d3f31b3698f2eafe61b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati animi cupiditate consectetur temporibus repudiandae voluptate sit aspernatur voluptatibus beatae neque iste dolor aut reiciendis distinctio non tempore accusamus, natus tenetur?",
            price,
            geometry: {
              type: 'Point',
              coordinates: [ 2.3483913391828537, 48.85349527412398 ]
            },
            images: [
              {
                url: 'https://res.cloudinary.com/ddcqy45zr/image/upload/v1719918036/YelpCamp/zuluwpoj5e8lnnfu4awv.jpg',
                filename: 'YelpCamp/zuluwpoj5e8lnnfu4awv',
              }
            ]
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})