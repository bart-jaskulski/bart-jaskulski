# gzip tl;dr

This will remove file after compression:

```sh
# Remove file after compression
gzip file

# Keep file
gzip -k file

# Decompress file, remove archive, store on fs
gzip -d file

# Decompress file, write to stdout
gzip -dc file
```

#linux
