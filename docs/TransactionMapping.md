## Transaction Mapping
A factory for mapping transaction sets to Javascript objects has been built-in as an alternative to other mapping scenarios, such as XSL documents. The `X12TransactionMap` class uses the query engine to accomplish this functionality. It operates on only a single transaction at a time.

The complete class for this factory can be found at [src/X12TransactionMap.ts](/src/X12TransactionMap.ts).

### To Object From Transaction Set

#### Mapping Data
The transaction mapper expects to be given an object with key/query pairs. Objects may be nested and will be resolved as they are encountered, descending further until the last object is handled.

When loops in a transaction are encountered, the mapper will take the first value in the loop series unless the `FOREACH` query macro is used. With `FOREACH` queries, the containing object will be coerced into an array of objects with the corresponding values from the loop.

Method `toObject` maps the transaction and returns the resulting object.

For convenience, every instance of the `X12Transaction` class contains a `toObject` method, with a required parameter of `map`.

#### Helper API
The transaction mapper will take an optional helper function. This function will be executed for every resolved value; the output of the function will set the value of the key. One way that this is being used in production is to resolve SCAC codes dynamically to their long form.

Supported parameters:
- `key`: The current key being evaluated (required)
- `value`: The current resolved value (required)
- `query`: The current query that was resolved (optional)
- `callback`: A callback to be executed within the helper function (optional)

When a helper is provided to the mapper, it is set as a property of the class. It will not be executed until the `toObject()` method is called. This method takes two optional parameters, `map` and `callback`. This permits the mapper to override the current map instance or to pass the callback to the helper function.

When calling `toObject()` from an instance of `X12Transaction`, a helper may be optionally passed. Callbacks are not supported in this scenario.

#### Supported Maps
At this time, only key/query maps are supported. These maps will resolve the query to a value (or values in the case of `FOREACH`) and return an object or objects conforming to the map.

An initial effort has been put into mapping an array of queries, but there is insufficient use case at this time for this and it should be considered a very rough beta and unsupported at this time.

### To Transaction Set From Object

#### Mapping Data

Method `fromObject` maps the transaction and returns the resulting object.

For convenience, every instance of the `X12Transaction` class contains a `fromObject` method, with required parameters of `input` and `map`. This will map the input to the current instance of `X12Transaction`.

#### Liquid Macro Language

The object map for mapping data to a transaction set differs significantly. It has more in common with [JS EDI Notation](./JSEDINotation.md). For example:
```json
{
  "header": ["940", "{{ macro | random }}"],
  "segments": [
    { "tag": "W05", "elements": ["N", "{{ input.internalOrderId }}", "{{ input.orderId }}"] },
    { "tag": "N1", "elements": ["ST", "{{ input.shippingFirstName }} {{ input.shippingLastName }}"] },
    { "tag": "N3", "elements": ["{{ input.shippingStreet1 }}", "{{ input.shippingStreet2 }}"] },
    ...etc
  ]
}
```

When loops are defined, it is done sequentially. Loops can either be manually written out, or some helper macros can be used to assist in generating them. If loops are to be generated dynamically, the first segment in the loop must have a `loopStart` and a `loopLength` property. The last segment in the loop must have a `loopEnd` property to signal that the loop has ended. For example:

```json
    { "tag": "LX", "elements": ["{{ 'LX' | sequence }}"], "loopStart": true, "loopLength": "{{ input.orderItems | json_parse | size }}" },
    { "tag": "W01", "elements":
      [
        "{{ input.orderItems | json_parse | map: 'quantity' | in_loop }}",
        "EA",
        "",
        "VN",
        "{{ input.orderItems | json_parse | map: 'sku' | in_loop }}"
      ]
    },
    { "tag": "G69", "elements": ["{{ input.orderItems | json_parse | map: 'title' | truncate: 45 | in_loop }}"], "loopEnd": true },
```

#### Liquid Macro API
The syntax for mapping is pure [Liquid](https://liquidjs.com/) with some additional macros for convenience. The object to map from is always referred to as `input`. There are some macros which do not take an input; it is considered useful to access them with the word `macro`, but any value can be passed to them since the value will be discarded.

When mapping from an object to a transaction set, an object may be passed as an argument which provides additional Liquid filters; the property name and the function value will be passed to [`Liquid.registerFilter`](https://liquidjs.com/api/classes/liquid_.liquid.html#registerFilter).

To use Liquid, simply install `liquidjs` via npm in your project, and then set your options when mapping to use `'liquidjs'`. This library will attempt to `require` Liquid and use it as the engine for mapping from an object.

The table of filters should not be considered exhaustive; see [Liquid's official site](https://shopify.github.io/liquid/) for details on filters, keeping in mind the custom filters that this library uses and provides in the table below.

|Property|Parameters|Example|Description|
|--------|----------|-------|-----------|
|**sequence**|string|`{{ 'LX' | sequence }}`|Method for assigning sequence values in a loop.|
|**in_loop**|string|`{{ input.someValue | in_loop }}`|Method for serializing values within a loop to preserve them for use by the loop; only use this as the last filter, see example for defining loops.|
|**json_parse**|string|`{{ '{\"example\": \"content\"}' | json_parse }}`|Method for returning an object from valid JSON.|
|**json_stringify**|string|`{{ inport.someObject | json_stringify }}`|Method for converting a value to valid JSON.|
|**size**|any[] |`{{ input.someArray | size }}`|Method for returning the length of an array or string. Default Liquid filter.|
|**map**|any[], string|`{{ input.someArray | map: 'someProperty' }}`|Method for returning an array of a specific property in array of objects.|
|**sum_array**|any[] |`{{ input.someArray | sum_array }}`|Method for returning the sum of an array of numbers.|
|**truncate**|string \| string[], number|`{{ input.someArray | truncate: 45 }}`|Method for truncating a string or array of strings to the desired character length. Overrides default Liquid implementation.|
|**random**|N/A|`{{ macro | random }}`|Method for returning a random 4 digit number.|
|**edi_date**|N/A,string|`{{ macro | edi_date: 'long' }}`|The current date; takes argument of `'long'` for YYYYmmdd or `'short'` for YYmmdd.|
|**edi_time**|N/A,string|`{{ macro | edi_time }}`|The current time in HHMM format.|

#### Legacy Macro Language

This option will be deprecated in version 2.x series to be replaced by Liquid. The internal, legacy macro language differs significantly from Liquid. For example:
```json
{
  "header": ["940", "macro['random']()['val']"],
  "segments": [
    { "tag": "W05", "elements": ["N", "input['sfOrderId']", "input['orderId']"] },
    { "tag": "N1", "elements": ["ST", "`${input['firstName']} ${input['lastName']}`"] },
    { "tag": "N3", "elements": ["input['addressStreet1']", "input['addressStreet2']"] }
    ...etc
  ]
}
```

When loops are defined, it is done sequentially. Loops can either be manually written out, or some helper macros can be used to assist in generating them. If loops are to be generated dynamically, the first segment in the loop must have a `loopStart` and a `loopLength` property. The last segment in the loop must have a `loopEnd` property to signal that the loop has ended. For example:

```json
    { "tag": "LX", "elements": ["macro['sequence']('LX')['val']"], "loopStart": true, "loopLength": "macro['length'](macro['json'](input['orderItems'])['val'])['val']" },
    { "tag": "W01", "elements":
      [
        "macro['map'](macro['json'](input['orderItems'])['val'], 'quantity')['val']",
        "EA",
        "",
        "VN",
        "macro['map'](macro['json'](input['orderItems'])['val'], 'sku')['val']"
      ]
    },
    { "tag": "G69", "elements": ["macro['map'](macro['json'](input['orderItems'])['val'], 'title')['val']"], "loopEnd": true }
```

#### Legacy Macro API
The syntax for legacy internal mapping is based on object properties. The object to map from is always referred to as `input`; to access the properties, use bracket notation. There is always a `macro` object; the properties and functions on this object should also be accessed by bracket notation. Macro functions should always return an object with a `val` property. When mapping from an object to a transaction set, an object may be passed as an argument which provides additional macro properties, or which may be used to override properties in the internal `macro` object.

|Property|Parameters|Example|Description|
|--------|----------|-------|-----------|
|**currentDate**|N/A|`macro['currentDate']`|The current date in YYYYmmdd format.|
|**sequence**|string|`macro['sequence']('LX')['val']`|Method for assigning sequence values in a loop.|
|**json**|string|`macro['json']('{\"example\": \"content\"}')['val']`|Method for returning an object from valid JSON.|
|**length**|any[] |`macro['length'](input['someArray'])['val']`|Method for returning the length of an array.|
|**map**|any[], string|`macro['map'](input['someArrayOfObjects'], 'someProperty')['val']`|Method for returning an array of a specific property in array of objects.|
|**sum**|any[], string, [number=0]|`macro['sum'](input['someArrayOfObjects'], 'someProperty')['val']`|Method for returning the sum of an array of numbers, with an optional decimal places parameter.|
|**random**|N/A|`macro['random']()['val']`|Method for returning a random 4 digit number.|
|**truncate**|string \| string[], number|`macro['truncate']("testing", 4)['val']`|Method for truncating a string or array of strings to the desired character length.|