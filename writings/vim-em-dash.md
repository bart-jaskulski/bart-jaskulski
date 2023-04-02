# Em dash in vim

I'm always frustrated about writing `--`, instead of `–` for en dash in vim, but
using digraphs can be bizarre. Why haven't I thought earlier about making it a
keybind, just as in most today's editors (LibreOffice, MS Office, etc)?

```vim
inoremap <buffer> --<space> –<space>
```

* <https://vi.stackexchange.com/questions/2199/what-is-the-easiest-way-to-insert-en-dash-in-vim>
