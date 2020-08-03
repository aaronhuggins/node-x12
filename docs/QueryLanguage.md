# Query Language

The query language makes it possible to directly select values from the class object model. This also drives the transaction mapping functionality; in fact, the `FOREACH()` macro was added specifically to support this feature.

## Basics

The basic query functionality is extremely simple: provide an EDI document as a string or as an `X12Interchange` and query the object model of that document. EDI is not really an object model format; however, the parser takes the rules of the EDI spec and populates JavaScript class objects.

### Object Model

The model defined by node-X12 is the following hierarchy:

```
X12Interchange
  ┗╸ X12FunctionalGroup
    ┗╸ X12Transaction
      ┣╸ X12Segment
      ┣╸ X12Segment
      ┗╸ etc.
```

The query engine will take raw EDI and convert it to an interchange, so it is always using this model.

### Engine Behavior

Due to the sequential nature of EDI, all look ups eventually are steps in an array. Although ASC X12 defines loops, the object model does not directly implement these loops. Therefore, the engine will actually step through each segment, checking the tag, and then attempting to return the value of the element at a specific psoition.

When no element can be found for a particular query, no result will be returned.

### Reference Lookups

References can be looked up using the tag name and position, using the traditional EDI reference name. In order to support parent-child segments, queries can refer to known values. When the known value of the reference is found, then each segment is stepped through to find the child segment.

## Macros

The query language has been extended with a concept of macros; the idea is that sometimes it is necessary to operate against more than one value at a time. This was especially relevant to how the `X12TransactionMap` class is designed, as it was necessary to be able to query for EDI loops.

Macros cannot be nested. If a nested macro appears to work then consider it to be unreliable, subject to misbehavior and breaking changes in future API updates/bugfixes.

### Supported Macros

| Macro       | Parameters                                        | Example                          | Description                                               |
| ----------- | ------------------------------------------------- | -------------------------------- | --------------------------------------------------------- |
| **FOREACH** | Tag: The segment tag to loop against              | `FOREACH(LX)=>MAN02:MAN01['CP']` | Loop against a parent tag to retrieve an array of values. |
| **CONCAT**  | Query: A valid EDI query<br />Separator: A string | `CONCAT(REF02,-)=>REF01`         | Lookup a value to concatenate to another value.           |

## Examples

|         Section         |     Example     | Description                                                                                         |
| :---------------------: | :-------------: | --------------------------------------------------------------------------------------------------- |
|       **Macros**        | `FOREACH(LX)=>` | Defines a multi-value operation on a query.                                                         |
|       **HL Path**       |   `HL+O+P+I`    | Defines a path through a series of HL segments.                                                     |
| **Parent Segment Path** |    `PO1-REF`    | Defines a path through a series of adjacent segments.                                               |
|  **Element Reference**  |     `REF02`     | Defines an element by position.                                                                     |
|        **Value**        |     `"DP"`      | Defines a value to be checked when evaluating qualifiers.<br />Single or double quotes may be used. |

**Example 1: Select `REF02` Elements**<br />
`REF02`

**Example 2: Select `REF02` Elements With a `PO` Qualifier in `REF01`**<br />
`REF02:REF01["PO"]`

**Example 3: Select Line-Level PO Numbers (850)**<br />
`PO1-REF02:REF01["PO"]`

**Example 4: Select ASN Line Quantities**<br />
`HL+S+O+P+I-LIN-SN102`

**Example 5: Select values from a loop series**<br />
`FOREACH(LX)=>MAN02:MAN01["CP"]`
