# Differences between GPT-3.5-turbo and GPT-4

As GPT-3.5-turbo is worse at following instructions, the most important stuff
should be repeated in user prompt or at the end of system prompt. Any rules
included at the very beginning of a prompt are likely to be forgotten, if are
overloaded with additional context or instructions. This may be helpful when
creating prompts which runs for both models, but only one of them has to take a
specific action.

On the other hand, GPT-3.5-turbo is more likely to make mistakes in negation
instructions, like "do not output anything except JSON". Using _positive_
messages are to be likely more successful: "Respond only with JSON object, avoid
any additional comments or wrappers like code fences"
