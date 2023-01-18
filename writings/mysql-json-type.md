# JSON in SQL (mysql)

Since `mysql` 5.7 (it's important, I mostly use 5.6, eh... WordPress) tables can
have `JSON` data type. It's convenient instead of serializing data to string.
Also comes with a bunch of functions (didn't care about performance yet),
capable of querying JSON data inside column.

ID | json_column
=================================
1 | {query: "my query"} 2 | {query: "not query"}

```sql
SELECT * WHERE JSON_EXTRACT(json_column, "$.query) = 'my query'
```
