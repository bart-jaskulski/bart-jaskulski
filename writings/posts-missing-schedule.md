# Post missing schedule in WordPress

Sometimes when a post is set to some schedule, the event is not registered. Still trying to figure out why, but it does not seem to be something straightforward (partially ruled out common errors, certain blocks, verbose failures or even race conditions).

For now I did not have time to investigate further, though I should set up some logging around it to
get the root of it. Seems to happen at random to newly scheduled posts and to those which have
already been scheduled, but somehow lost schedule event along the way.

For now to validate, I have this neat ai-generated script:

```bash
wp eval '
  $posts = get_posts([
      "post_type" => "post",
      "post_status" => "future",
      "posts_per_page" => -1,
      "orderby" => "date",
      "order" => "ASC",
  ]);
  foreach ($posts as $post) {
      $next = wp_next_scheduled("publish_future_post", [$post->ID]);
      printf(
          "%d | due UTC: %s | event UTC: %s\n",
          $post->ID,
          $post->post_date_gmt,
          $next ? gmdate("Y-m-d H:i:s", $next) : "MISSING"
      );
  }'
```

#wordpress
