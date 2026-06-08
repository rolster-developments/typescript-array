# Rolster Array Utilities

Utility package for manipulating Array compatible with Typescript projects.

## Installation

```
npm i @rolster/arrays
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Features

All helpers are pure functions: they never mutate the array you pass in, they
return a new collection (or value) instead.

### Querying

| Function                | Description                                                  |
| ----------------------- | ------------------------------------------------------------ |
| `inArray(array, value)` | Returns `true` when `value` is contained in `array`.         |
| `first(array)`          | Returns the first element, or `null` when the array is empty.|
| `last(array)`           | Returns the last element, or `null` when the array is empty. |

```typescript
import { inArray, first, last } from '@rolster/arrays';

inArray([1, 2, 3], 2); // true

first([10, 20, 30]); // 10
first([]); // null

last([10, 20, 30]); // 30
last([]); // null
```

### Immutable mutations

| Function                          | Description                                                            |
| --------------------------------- | ---------------------------------------------------------------------- |
| `push(array, element)`            | Returns a new array with `element` appended.                           |
| `refresh(array, element, fn)`     | Replaces every element matching the `fn` criteria with `element`.      |
| `destroy(array, fn)`              | Removes every element matching the `fn` criteria.                      |
| `remove(array, index)`            | Removes the element located at `index`.                                |

```typescript
import { push, refresh, destroy, remove } from '@rolster/arrays';

const users = [
  { id: 1, name: 'Daniel' },
  { id: 2, name: 'Andrés' }
];

push(users, { id: 3, name: 'Pedro' });
// [ ...users, { id: 3, name: 'Pedro' } ]

refresh(users, { id: 2, name: 'Castillo' }, (user) => user.id === 2);
// id 2 is replaced, the rest stays the same

destroy(users, (user) => user.id === 1);
// [ { id: 2, name: 'Andrés' } ]

remove(users, 0);
// [ { id: 2, name: 'Andrés' } ]
```

### Iteration with break

`each` behaves like `Array.prototype.forEach`, but returning `true` from the
callback breaks the loop early. It returns `false` when the loop was broken
(and invokes `catchError` with the element that broke it) or `true` when it ran
to completion.

```typescript
import { each } from '@rolster/arrays';

const completed = each({
  array: [1, 2, 3, 4],
  fnEach: (value) => value === 3, // break on 3
  catchError: (value, index) => {
    console.log(`stopped at index ${index} with value ${value}`);
  }
});

completed; // false
```

### Reducing and mapping

`reduceDistinct` projects each element to a value and keeps only the distinct
results.

```typescript
import { reduceDistinct } from '@rolster/arrays';

reduceDistinct(
  [
    { city: 'Bogotá' },
    { city: 'Medellín' },
    { city: 'Bogotá' }
  ],
  (item) => item.city
);
// ['Bogotá', 'Medellín']
```

`mapToReduce` groups elements by an identifier and merges every element that
shares the same identifier into a single value.

```typescript
import { mapToReduce } from '@rolster/arrays';

const lines = [
  { invoice: 'A', total: 100 },
  { invoice: 'A', total: 50 },
  { invoice: 'B', total: 30 }
];

mapToReduce(lines, {
  identifier: (line) => line.invoice,
  elementToValue: (line) => ({ invoice: line.invoice, total: 0 }),
  reducer: (line, value) => {
    value.total += line.total;
  }
});
// [ { invoice: 'A', total: 150 }, { invoice: 'B', total: 30 } ]
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
