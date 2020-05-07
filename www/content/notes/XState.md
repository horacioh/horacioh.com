# XState

- enumerate only the possible states to remove impossible states on your app [video](https://egghead.io/lessons/javascript-eliminate-boolean-explosion-by-enumerating-states)

here's is how it looks a state machine

```js
// let's use a lightbulb example...

// states are objects
const lit = {};
const unlit = {};
const broken = {};

// then we can combine our states in one object
const states = { lit, unlit, broken };

// we need an initial state
const initial = "unlit";

// then we can also combine states and initial state (config) and this is what we can pass to our state machine
const config = {
  id: "lightBulbMachine", // the config should have an ID
  initial,
  states,
};
```

Now we need to enumerate all the possible events that our machine can handle. In order to do that, we need to define on every state the possible events that can be triggered to change the state, we do it with the `on` property on our state objects

```js
const lit = {
  on: {
    BREAK: "BROKEN",
    TOGGLE: "unlit",
  },
};
const unlit = {
  on: {
    BREAK: "BROKEN",
    TOGGLE: "lit",
  },
};
const broken = {};
// because broken is the final state, we can leave the state object empty, but we can also add a `type: 'final'` on it to make it more explicit
```

by convention, the name of the event is capitalize, and the value of the event is the target state name we want to transition to.

Now we are ready to import the [XState library](https://github.com/davidkpiano/xstate) to test it.
