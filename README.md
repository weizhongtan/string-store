# string-store
Micro-service for storing and retrieving text strings.

__Usage:__

```
$ curl $domain/messages/ -d 'my test message to store'

{"id":12345}
```
 
 ```
$ curl $domain/messages/12345
 
my test message to store
```
