# string-store
Micro-service for storing and retrieving text strings.

It is deployed at [https://string-store.herokuapp.com/messages](https://string-store.herokuapp.com/messages) (it may take ~10s for Heroku to initially spin up)

__Usage__

```
$ curl https://string-store.herokuapp.com/messages/ -d 'The quick brown fox jumps over the lazy dog'
{"id":9e107d9d372bb6826bd81d3542a419d6}
```
 
 ```
$ curl https://string-store.herokuapp.com/messages/9e107d9d372bb6826bd81d3542a419d6
The quick brown fox jumps over the lazy dog
```

 ```
$ curl https://string-store.herokuapp.com/messages/9e107d9d372bb6826bd81d3542a419d6 -X DELETE
Text string with id: 9e107d9d372bb6826bd81d3542a419d6 was deleted.
```

 ```
$ curl https://string-store.herokuapp.com/messages/stats
There are 11 strings in the database.
```

To run locally:
* install MongoDB, set up data/db folder
* run `mongod`
* in another terminal run `npm run start`

__Design choices__
* The database is opened when the app is run, and the connection object is reused for subsequent requests. This takes advantage of the mongodb connection pooling and prevents the need to open and close the database for each request. It is set to attempt to reconnect infinitely if the connection is lost. Any pending requests during this time are put in a buffer which are resolved once the server has re-established a connection.

* Each string is inserted using its MD5 hash as its primary key. This prevents duplicate strings from being stored multiple times, saving space.

* The _id of each string is set to the hash, so that it is automatically indexed in a binary tree structure. This allows it to be found rapidly independent of the database size.

* The application/x-www-form-urlencoded content header type set by curl –d does not have good support for non-alphanumeric characters.

Wei-Zhong Tan
