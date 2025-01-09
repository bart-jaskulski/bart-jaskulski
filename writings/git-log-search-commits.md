# Checking git commits based on repo content

Interactive way to look for all git commits containing a string with further
examination.

```sh
git log --all -S "SubscriptionEnd" --oneline | fzf --preview 'git show {1} -- ./src' --bind 'enter:execute(git show {1})'
```
