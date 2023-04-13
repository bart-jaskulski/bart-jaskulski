# Adding collaborative comments to code

I miss document editor experience, when collaborating on new git repository,
specifically adding comments to particular pieces of code. In GitHub or GitLab
it is only possible to create a new issue, referring to line or attaching a
piece of code, but for large amount of comments issues doesn't seem to be the
best method.

For the time being what seems to be the best option is to create a new, empty
branch and requesting a merge into it. With such solution you create a diff
against void, and you are able to rather easily add multiple notes, when working
from scratch on some software.

To create an emtpy branch:

```shell
git switch --orphan <new branch>
git commit --allow-empty
```
