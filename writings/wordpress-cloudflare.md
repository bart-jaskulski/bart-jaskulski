# WordPress i Cloudflare

Ustawienie DNS potrafi namieszać z redirect loop w WordPressie.

Szybkie rozwiązanie to

```php
define('FORCE_SSL_ADMIN', false);
```

Można też skorzystać z
wtyczki<sup><a href="#reference-1" aria-label="Reference 1">1</a></sup>.

<ol class="references">
<li id="reference-1"><a href="https://community.cloudflare.com/t/endless-redirect-with-wordpress/3914">https://community.cloudflare.com/t/endless-redirect-with-wordpress/3914</a></li>
</ol>
