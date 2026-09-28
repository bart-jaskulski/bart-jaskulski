# Remove interval within called callback

Due to JavaScript's way of passing variables to closures you are able to remove
interval or timeout created with native function within it's callback.

```js
const i = setInterval(
    () => clearInterval(i),
    1000
);
```

#js
