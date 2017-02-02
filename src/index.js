const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

const app = express()
const port = process.env.PORT || 8000
const ip = process.env.IP || 'localhost'
const mongoUrl = process.env.MONGODB_URI || `mongodb://${ip}/local`

// apply body parser middleware to post requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// router for string creation
app.post('/messages/', (req, res) => {
  // extract the text from the post body
  const text = Object.getOwnPropertyNames(req.body)[0]

  // open database
  MongoClient.connect(mongoUrl, (err, db) => {
    if (err) throw err
    // open collection
    const strings = db.collection("strings")

    // create value hash as the primary key
    strings.createIndex( { _id: "hashed" } )

    // define text document
    const doc = { text }

    strings.insert(doc, (err, data) => {
      if (err) throw err
      // confirm data
      res.end(JSON.stringify(data))

      // close database
      db.close()
    })
  })
})

// router for string retrieval
app.get('/messages/:id', (req, res) => {
  const id = req.params.id
  if (id.length > 0) {
    // get retreive from MONGODB_URI
  }
  res.end(`getting string id: ${id}`)
})

// default response
app.use('/*', (req, res) => {
  res.end('Usage: $domain/messages/ -d "message"\nor:    $domain/messages/id')
})

app.listen(port, ip, () => {
  console.log(`Server listening on ${ip}:${port}.`)
})
