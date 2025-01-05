# WordPress REST API always jsonifies response

Each time, you return something as `WP_REST_Response`, content of this response
is passed through `json_encode` function. This way it's impossible to serve any
other content, especially relying on raw string. Such value would be encoded
from `"string"` to JSON form of `""string""`. As long as we use objects and
arrays it's fine, but for scalar types (and content types other than JSON-based)
we cannot rely on WP REST API directly.

To mitigate this, you can hook into `rest_pre_serve_request` and handle REST
server response yourself.
