# string-store
Micro-service for storing and retrieving text strings.

It is deployed at [https://string-store.herokuapp.com/messages](https://string-store.herokuapp.com/messages) (it may take ~10s for Heroku to spin up)

__Usage:__

```
$ curl https://string-store.herokuapp.com/messages/ -d 'The quick brown fox jumps over the lazy dog'

{"id":9e107d9d372bb6826bd81d3542a419d6}
```
 
 ```
$ curl https://string-store.herokuapp.com/messages/9e107d9d372bb6826bd81d3542a419d6
 
The quick brown fox jumps over the lazy dog
```

To run locally:
* install MongoDB
* run `mongod`
* in another terminal run `npm run start`
