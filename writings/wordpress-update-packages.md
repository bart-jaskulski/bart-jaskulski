# The WordPress way of resolving update packages

Plugin updates in WordPress can behave in rather indeterministic way, dependent
on the way, plugin is archived and the source it comes from.

To begin with distribution package, as plugin author you have two possibilities
to pack your plugin:

1. Inside single parent directory, which then becomes target name for plugin
1. Use *flat* directories architecture, i.e. after unpacking, your files lie in
   top-level directory

I used to thought that name of your zip package matters (e.g. `my-plugin.zip`),
but in the first case cases it's not the truth.

```
$ unzip -l my-plugin.zip
Archive: /home/user/my-plugin.zip
awesome-plugin/awesome-plugin.php
```

In such case, WordPress will infer top-level folder name (`awesome-plugin`),
making it my plugin slug, thus target update folder. Simple as that.

And in most cases it's preferable method of packing a plugin, as **the only
reliable and predictable**.

Although, second method (flat-package) *may* lead to manipulation of plugin slug
and deactivation. It only may because it depends on update method and differs
between direct plugin upload and fetching remote package.

Following case will influence our plugin slug by zip package name -- slug
becomes `my-plugin`.

```
$ unzip -l my-plugin.zip
Archive: /home/user/my-plugin.zip
awesome-plugin.php
```

Yet, this is only true while you upload your plugin directly to WordPress, e.g.
through admin panel (or any package which is local to server).

When we deal with remote fetch of plugin package (and we deal with that 90% of
time), package is saved on our server as temporary file, which later has great
implications, as our zip is stored with 6 random chars suffix. You can imagine
by this far, what will happen when we try to unzip such file.

```
$ unzip -l my-plugin-yUi4dk.zip
Archive: /home/user/my-plugin-yUi4dk.zip
awesome-plugin.php
```

Once again, WordPress grabs our destination plugin's slug from zip file name,
and our slug becomes `my-plugin-yUi4dk`.

Additionally, during the upgrade there's a cleanup process which deletes old
plugin. The flow goes like:

1. Click update plugin button.
1. New plugin release is downloaded and extracted as `my-plugin-yUi4dk`.
1. Previous plugin release is discarded.
1. WordPress cannot execute non-existing `my-plugin/awesome-plugin.php`, thus
   deactivates plugin.
1. Updated `my-plugin-yUi4dk/awesome-plugin.php` doesn't fit it's predecessor
   name, so it's considered separate plugin, but it's never been requested to
   activate it.
1. You end up with inactive plugin after update.

There's more to that when you consider private, paid plugins which authenticates
through some API key, usually bond with plugin slug (as you should safely
expect, this value will never be changed). When client tries to reactivate
plugin, the API key is gone because what client activated is not our original
plugin anymore.
