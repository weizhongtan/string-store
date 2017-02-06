'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// defaults port to 8000 if one is not given in the environment
const port = process.env.PORT || 8000

// open database and collection asyncronously
require('./model/db').initialize(collection => {
  const strings = collection

  // parse all requests bodies as text
  app.use(bodyParser.text({type: '*/*'}))

  // add routes
  app.use(require('./routes/get-all-ids.js')(strings))
  app.use(require('./routes/get-stats.js')(strings))
  app.use(require('./routes/insert-string.js')(strings))
  app.use(require('./routes/get-or-delete-id.js')(strings))

  // default response
  app.use('/*', (req, res) => {
    res.end(`Usage: curl $domain/messages/ -d "message"
  or:    curl $domain/messages/id
  or:    curl $domain/messages/id -X DELETE
  or:    curl $domain/messages/all
  or:    curl $domain/messages/stats\n`
  )})

  // once db and collection is established, start listening
  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`)
  })
})
