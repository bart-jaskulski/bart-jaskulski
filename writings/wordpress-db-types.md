# Avoid saving not-string data to WordPress database

Saving data to options (`update_option`) or post meta (`update_post_meta`) may
be unpredictable at first when using `booleans` or `integers`, especially when
you rely on data type.

WordPress supposedly serializes data before saving to database but that's not
the case for scalar types, which are just casted to string.

> Serialized `false` produces `b:0`, but casted to string is `''` (empty string)

Getting such data from a database with standard functions (`get_option`,
`get_post_meta`) returns any value as `string`. Don't you even think about
strict type comparison!

When you try to save bunch of connected data values (e.g. plugin global
settings) it may be the best to group those elements and save it as one option
after `json_encode`.
