# Removing commits from github

In case of leaking secrets in github, the only viable way of removing commit
from web access is to nuke the repository.

Removing commit with `git filter-repo` is the first thing to do, but it only
removes it from plainly available history, still dangling and waiting to be
pruned by `git gc`. And github is known to keep dangling commits for a long
time[^1]. If you
don't have a time to contact github support, make repository private and/or
remove it completely (you can always recreate it later, but you will miss all
stargazers, etc.)

```sh
git filter-repo --path path/to/remove1 --invert-paths
git push --force --verbose --dry-run
git push --force
```

[^1]: https://stackoverflow.com/a/32840254
