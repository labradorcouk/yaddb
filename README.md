# yaddb

Yet Another Dynamo DB lib

# Motivation

We like [Dynasty](https://github.com/victorquinn/dynasty) but it's written in CoffeScript, it's barely maintained and there's no recursive scan functionality, its main goals is also to hide the awkward syntax for querying Dynamo, we often need that power so this library is a tiny wrapper around Amazon DynamoDB and document Client to avoid repeating ourselves writing `.promise()` on each call.
Also, by hiding the internals of Dynamo you'd be forced to write your own documentation, instead of leveraging AWS docs.

It's not meant to be complete, albeit pull requests for missing functions are more than welcome, we implemented the functions that we use the most, and for now, that's it.

# Usage

```bash
npm i yaddb
```

For usage please see the tests.
