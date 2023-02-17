# Loading vim quickfix list from grep

One of things, I always forget about, but seems cool.

```sh
vim -q <(grep -RHn <query>)
```
