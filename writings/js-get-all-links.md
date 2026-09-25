# Get all links from website

```js
[...document.links]
    .filter(el => el.href.includes('https'))
    .map(el => el.href)
```

Later I can "Copy Object", and e.g. download the files, with

```sh
xclip -sel cli -o | jq '.[]' | xargs -n1 -P4 curl -O
```

#js
