# string-store
Micro-service for storing and retrieving text strings.
It is deployed at:

[https://string-store.herokuapp.com/messages](https://string-store.herokuapp.com/messages)

(it may take ~10s for Heroku to spin up on first use)

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
$ curl https://string-store.herokuapp.com/messages/all
e3e6228161c29eb5a44cde6de3e7ee0b
c635a1fad8626b73ab96046a38f8e70d
1e0b9b7ca005a3bb3f877ea18efeb4fb
1b424f2537e2e02770546d67708d14a6
e1e1d3d40573127e9ee0480caf1283d6
9b759040321a408a5c7768b4511287a6
1a3441fdd7bdad387d8df1f036eb7a44
```

 ```
$ curl https://string-store.herokuapp.com/messages/stats
There are 7 strings in the database.
```

To run locally:
* install MongoDB, set up data/db folder
* run `mongod`
* in another terminal run `npm run start`

__Design choices__
* The database is opened when the app is run, and the connection object is reused for subsequent requests. This takes advantage of the mongodb connection pooling and prevents the need to open and close the database for each request. It is set to attempt to reconnect infinitely if the connection is lost. Any pending requests during this time are put in a buffer which are resolved once the server has re-established a connection.

* Each string is inserted using its MD5 hash as its primary key. This prevents duplicate strings from being stored multiple times, saving space.

* The \_id of each string is set to the hash, so that it is automatically indexed in a binary tree structure. This allows it to be found rapidly independent of the database size.

* Only ASCII characters are supported since the application/x-www-form-urlencoded content header type set by `curl –d` does not have good support for non-alphanumeric characters.

* I decided not to implement an update function, since every possible string has a unique id anyway (most likely), due to the hash used.

Wei-Zhong Tan
