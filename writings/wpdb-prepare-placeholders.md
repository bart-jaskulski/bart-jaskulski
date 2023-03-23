# `$wpdb->prepare` gotcha with placeholders

`$wpdb->prepare` is a function which works similarly to `sprintf`, but is
targeted for sanitizing database query. I'm putting aside the superiority of
using prepared statements.

Most commonly used placeholder is `%s` to insert a string value, but it may get
more complicated when you try to prepare values inside `WHERE IN` statement
beforehand and later dump them as one value. Whether it's correct may be another
topic, but similar code will fail due to `%s` always being wrapped in quotes.

```php
$wpdb->query($wpdb->prepare( "SELECT * FROM wp_posts WHERE ID IN (%s)", implode(', ', [1, 2, 3])));
```

Result is `SELECT * FROM wp_posts WHERE ID IN ('1, 2, 3')`.

You can workaround this behavior using positional placeholders, but then you
need to remember about wrapping with quote yourserf it may be needed.
