import express from 'express'
import bodyParser from 'body-parser'

const app = express()
const port = process.env.PORT || 8000
const mongoUrl = process.env.MONGODB_URI || null;

// apply body parser middleware to post requests
app.post(bodyParser.urlencoded({
    extended: true
  })
);
app.post(bodyParser.json())

// router for string creation
app.post('/messages/', (req, res) => {
  // extract the text from the post body
  const text = Object.getOwnPropertyNames(req.body)
  console.log(text)
  res.end()
})

// router for string retrieval
app.get('/messages/:id', (req, res) => {

})

// default response
app.use('/*', (req, res) => {
  res.end('Usage: $domain/messages/ -d "message"')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`)
})
