# dependent-flags-demo

A [demonstration](https://koomen.github.io/dependent-flags-demo/) of a simple stateless implementation of "flag dependencies" with Optimizely Full Stack

## Try it out

Check out the demo [here](https://koomen.github.io/dependent-flags-demo/).

The source code is in the [docs](/docs) directory in this repository.

## What are stateless flag dependencies?

Imagine you're working with three Optimizely Full Stack [Feature Flags](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/create-feature-flags):,`flag_1`, `flag_2`, and `flag_3`:

- `flag_1` and `flag_2` each have their own [flag rules](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/interactions-between-flag-rules). 
- `flag_3` should be `on` for everyone for whom `flag_1` and `flag_2` are also on. 

In this scenario, `flag_3` _depends on_ `flag_1` and `flag_2`. When a decision for `flag_3` is made, these dependencies can be evaluated `statelessly` or `statefully`:

- **Stateless** dependency evaluation works by checking whether `flag_1` and `flag_2` are `on` for a given user _at the moment that a decision for `flag_3` is required_. 
- **Stateful** dependency evaluation works by checking whether `flag_1` and `flag_2` _were explicitly evaluated as `on` for a given user at some point before_ a decision is required for `flag_3`.

This demo implements stateless flag dependencies.

## How to specify a dependency

With this approach, a Full Stack user can specify flag dependencies in the Optimizely Full Stack UI by adding a special `_depends` [flag variable](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/create-flag-variations):

![Specifying flag dependencies](docs/img/dependencies.png)

Dependencies are specified in the default value of the `_depends` variable using a comma-separated list of flag keys.

## How it works (implementation)

[`optimizely_flag_dependencies.js`](/docs/optimizely_flag_dependencies.js) exports one function: `createInstance()`.

This function behaves exactly like the Optimizely Full Stack [`createInstance()` method](https://docs.developers.optimizely.com/experimentation/v4.0.0-full-stack/docs/initialize-sdk-javascript) with one difference:

`optimizely_flag_dependencies.createInstance()` returns an Optimizely client instance with an additional bound method, `decideWithDependencies()`.

The following code example captures the relationship between `optimizelyClient.decideDependencies()` and `user.decide()`:

```js
import * as optimizely_flag_dependencies from "./optimizely_flag_dependencies.js";

// Instantiate an Optimizely client object
var optimizelyClient = optimizely_flag_dependencies.createInstance({ sdkKey: "LbmzK7viE2J2bP5ozmZR9" });

// Create a user context object
var user = optimizelyClient.createUserContext("user123");

// Decide whether `flag_3` is enabled for `user123`, ignoring any dependencies
var decisionWithoutDependencies = user.decide("flag_3");

// Decide whether `flag_3` is enabled for `user123` only if all dependencies are also enabled right now
var decisionWithDependencies = optimizelyClient.decideWithDependencies(user, "flag_3")
```
