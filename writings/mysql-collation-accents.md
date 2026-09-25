# Collation and accents in database

It is generally recommended to use `utf8mb4_general_ci` collation for columns,
but sometimes it may be misleading, especially in conjunction with `UNIQUE`
constraint on `VARCHAR` field.

Some accents are cut off from general_ci, when comparing phrases and it may lead
to constraint violation even though visually strings seems different. One
example, I've stumbled upon is Hungarian: _Kömlő_ and _Komló_. Take under
consideration, that there are different languages, besides Hungarian in the
database, so using specialized collation is not the case.

In such situation it's best to change column's collation to `utf8mb4_bin`, which
compares characters by it's binary representation, but is unusable for any
additional features provided by collation, like correct sort order (accents come
last with `_bin`). Furthermore:

> utf8_bin says to just compare the bytes. CHAR/TEXT utf8 with utf8_bin
> validates (on INSERT) that the bytes comprise valid utf8 bytes, but does not
> do
> anything useful for comparisions other than exact (no case folding, etc)
> equality. BINARY/BLOB should be usually be used instead CHAR+utf8; this stores
> the bytes without any
> checking.[^1]

[^1]: https://mysql.rjweb.org/doc.php/charcoll
