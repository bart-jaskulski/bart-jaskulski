# WordPress repository runs basic PHP check upon plugin deploy, and it can be mischievous

sometimes... Look at this:

```
***********************************
PHP error in: flexible-subscriptions/tags/1.0.0/vendor_prefixed/symfony/polyfill-php80/Resources/stubs/Attribute.php:
Parse error: syntax error, unexpected fully qualified name "\class_alias" in Standard input code on line 40
Errors parsing Standard input code
***********************************
```

Regular scoped code... I don't know which version of PHP can actually report
such parse error, although I've been testing it with 8.0-8.3, 7.0, 7.1, and 5.6.

General recommendation – never scope polyfill code, as it makes no sense.
