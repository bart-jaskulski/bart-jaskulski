# Max index length in older MySQL

A reminder: max index length in MySQL was 767 bytes. I learned that the hard
way, as unique constraint on BIGINT and VARCHAR (255) resulted in exhaustion of
this space. In general, anything with VARCHAR, when supporting UTF-8 is
considered will probably be too big to put a valid index on it because max size
of such column would take up to 1020 bytes (255 * 4).
