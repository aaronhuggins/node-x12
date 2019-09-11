## Transaction Mapping
A factory for mapping transaction sets to Javascript objects has been built-in as an alternative to other mapping scenarios, such as XSL documents or Liquid templates. The `X12TransactionMap` class uses the query engine to accomplish this functionality. It operates on only a single transaction at a time.

The complete class for this factory can be found at [src/X12TransactionMap.ts](/src/X12TransactionMap.ts).

### Mapping Data
The transaction mapper expects to be given an object with key/query pairs. Objects may be nested and will be resolved as they are encountered, descending further until the last object is handled.

When loops in a transaction are encountered, the mapper will take the first value in the loop series unless the `FOREACH` query macro is used. With `FOREACH` queries, the containing object will be coerced into an array of objects with the corresponding values from the loop.

Method `toObject` maps the transaction and returns the resulting object.

For convenience, every instance of the `X12Transaction` class contains a `toObject` method, with a required parameter of `map`.

### Helper API
The transaction mapper will take an optional helper function. This function will be executed for every resolved value; the output of the function will set the value of the key. One way that this is being used in production is to resolve SCAC codes dynamically to their long form.

Supported parameters:
- `key`: The current key being evaluated (required)
- `value`: The current resolved value (required)
- `query`: The current query that was resolved (optional)
- `callback`: A callback to be executed within the helper function (optional)

When a helper is provided to the mapper, it is set as a property of the class. It will not be executed until the `toObject()` method is called. This method takes two optional parameters, `map` and `callback`. This permits the mapper to override the current map instance or to pass the callback to the helper function.

When calling `toObject()` from an instance of `X12Transaction`, a helper may be optionally passed. Callbacks are not supported in this scenario.

### Supported Maps
At this time, only key/query maps are supported. These maps will resolve the query to a value (or values in the case of `FOREACH`) and return an object or objects conforming to the map.

An initial effort has been put into mapping an array of queries, but there is insufficient use case at this time for this and it should be considered a very rough beta and unsupported at this time.