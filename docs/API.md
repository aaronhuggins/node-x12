## Classes

<dl>
<dt><a href="#X12Element">X12Element</a></dt>
<dd></dd>
<dt><a href="#X12FatInterchange">X12FatInterchange</a></dt>
<dd></dd>
<dt><a href="#X12FunctionalGroup">X12FunctionalGroup</a></dt>
<dd></dd>
<dt><a href="#X12Generator">X12Generator</a></dt>
<dd></dd>
<dt><a href="#X12Interchange">X12Interchange</a></dt>
<dd></dd>
<dt><a href="#X12Parser">X12Parser</a></dt>
<dd></dd>
<dt><a href="#X12QueryEngine">X12QueryEngine</a></dt>
<dd></dd>
<dt><a href="#X12Segment">X12Segment</a></dt>
<dd></dd>
<dt><a href="#X12Transaction">X12Transaction</a></dt>
<dd></dd>
<dt><a href="#X12TransactionMap">X12TransactionMap</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#defaultSerializationOptions">defaultSerializationOptions([options])</a> ⇒ <code><a href="#X12SerializationOptions">X12SerializationOptions</a></code></dt>
<dd><p>Set default values for any missing X12SerializationOptions in an options object.</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#X12QueryResult">X12QueryResult</a> : <code>object</code></dt>
<dd><p>A result as resolved by the query engine.</p></dd>
<dt><a href="#X12SerializationOptions">X12SerializationOptions</a> : <code>object</code></dt>
<dd><p>Options for serializing to and from EDI.</p></dd>
</dl>

<a name="X12Element"></a>

## X12Element
**Kind**: global class  
<a name="new_X12Element_new"></a>

### new X12Element(value)
<p>Create an element.</p>


| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | <p>A value for this element.</p> |

<a name="X12FatInterchange"></a>

## X12FatInterchange
**Kind**: global class  

* [X12FatInterchange](#X12FatInterchange)
    * [new X12FatInterchange([items], [options])](#new_X12FatInterchange_new)
    * [.toString([options])](#X12FatInterchange+toString) ⇒ <code>string</code>
    * [.toJSEDINotation()](#X12FatInterchange+toJSEDINotation) ⇒ <code>Array.&lt;JSEDINotation&gt;</code>
    * [.toJSON()](#X12FatInterchange+toJSON) ⇒ <code>Array.&lt;object&gt;</code>

<a name="new_X12FatInterchange_new"></a>

### new X12FatInterchange([items], [options])
<p>Create a fat interchange.</p>


| Param | Type | Description |
| --- | --- | --- |
| [items] | [<code>Array.&lt;X12Interchange&gt;</code>](#X12Interchange) \| [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>The items for this array or options for this interchange.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12FatInterchange+toString"></a>

### x12FatInterchange.toString([options]) ⇒ <code>string</code>
<p>Serialize fat interchange to EDI string.</p>

**Kind**: instance method of [<code>X12FatInterchange</code>](#X12FatInterchange)  
**Returns**: <code>string</code> - <p>This fat interchange converted to EDI string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options to override serializing back to EDI.</p> |

<a name="X12FatInterchange+toJSEDINotation"></a>

### x12FatInterchange.toJSEDINotation() ⇒ <code>Array.&lt;JSEDINotation&gt;</code>
<p>Serialize interchange to JS EDI Notation object.</p>

**Kind**: instance method of [<code>X12FatInterchange</code>](#X12FatInterchange)  
**Returns**: <code>Array.&lt;JSEDINotation&gt;</code> - <p>This fat interchange converted to an array of JS EDI notation.</p>  
<a name="X12FatInterchange+toJSON"></a>

### x12FatInterchange.toJSON() ⇒ <code>Array.&lt;object&gt;</code>
<p>Serialize interchange to JSON object.</p>

**Kind**: instance method of [<code>X12FatInterchange</code>](#X12FatInterchange)  
**Returns**: <code>Array.&lt;object&gt;</code> - <p>This fat interchange converted to an array of objects.</p>  
<a name="X12FunctionalGroup"></a>

## X12FunctionalGroup
**Kind**: global class  

* [X12FunctionalGroup](#X12FunctionalGroup)
    * [new X12FunctionalGroup([options])](#new_X12FunctionalGroup_new)
    * [.setHeader(elements, [options])](#X12FunctionalGroup+setHeader)
    * [.addTransaction([options])](#X12FunctionalGroup+addTransaction) ⇒ [<code>X12Transaction</code>](#X12Transaction)
    * [.toString([options])](#X12FunctionalGroup+toString) ⇒ <code>string</code>
    * [.toJSON()](#X12FunctionalGroup+toJSON) ⇒ <code>object</code>

<a name="new_X12FunctionalGroup_new"></a>

### new X12FunctionalGroup([options])
<p>Create a functional group.</p>


| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12FunctionalGroup+setHeader"></a>

### x12FunctionalGroup.setHeader(elements, [options])
<p>Set a GS header on this functional group.</p>

**Kind**: instance method of [<code>X12FunctionalGroup</code>](#X12FunctionalGroup)  

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>Array.&lt;string&gt;</code> | <p>An array of elements for a GS header.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12FunctionalGroup+addTransaction"></a>

### x12FunctionalGroup.addTransaction([options]) ⇒ [<code>X12Transaction</code>](#X12Transaction)
<p>Add a transaction set to this functional group.</p>

**Kind**: instance method of [<code>X12FunctionalGroup</code>](#X12FunctionalGroup)  
**Returns**: [<code>X12Transaction</code>](#X12Transaction) - <p>The transaction which was added to this functional group.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12FunctionalGroup+toString"></a>

### x12FunctionalGroup.toString([options]) ⇒ <code>string</code>
<p>Serialize functional group to EDI string.</p>

**Kind**: instance method of [<code>X12FunctionalGroup</code>](#X12FunctionalGroup)  
**Returns**: <code>string</code> - <p>This functional group converted to EDI string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12FunctionalGroup+toJSON"></a>

### x12FunctionalGroup.toJSON() ⇒ <code>object</code>
<p>Serialize functional group to JSON object.</p>

**Kind**: instance method of [<code>X12FunctionalGroup</code>](#X12FunctionalGroup)  
**Returns**: <code>object</code> - <p>This functional group converted to an object.</p>  
<a name="X12Generator"></a>

## X12Generator
**Kind**: global class  

* [X12Generator](#X12Generator)
    * [new X12Generator([jsen], [options])](#new_X12Generator_new)
    * [.setJSEDINotation([jsen])](#X12Generator+setJSEDINotation)
    * [.getJSEDINotation()](#X12Generator+getJSEDINotation) ⇒ <code>JSEDINotation</code>
    * [.setOptions([options])](#X12Generator+setOptions)
    * [.getOptions()](#X12Generator+getOptions) ⇒ [<code>X12SerializationOptions</code>](#X12SerializationOptions)
    * [.validate()](#X12Generator+validate) ⇒ [<code>X12Interchange</code>](#X12Interchange)
    * [.toString()](#X12Generator+toString) ⇒ <code>string</code>

<a name="new_X12Generator_new"></a>

### new X12Generator([jsen], [options])
<p>Factory for generating EDI from JS EDI Notation.</p>


| Param | Type | Description |
| --- | --- | --- |
| [jsen] | <code>JSEDINotation</code> | <p>Javascript EDI Notation object to serialize.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Generator+setJSEDINotation"></a>

### x12Generator.setJSEDINotation([jsen])
<p>Set the JS EDI Notation for this instance.</p>

**Kind**: instance method of [<code>X12Generator</code>](#X12Generator)  

| Param | Type | Description |
| --- | --- | --- |
| [jsen] | <code>JSEDINotation</code> | <p>Javascript EDI Notation object to serialize.</p> |

<a name="X12Generator+getJSEDINotation"></a>

### x12Generator.getJSEDINotation() ⇒ <code>JSEDINotation</code>
<p>Get the JS EDI Notation for this instance.</p>

**Kind**: instance method of [<code>X12Generator</code>](#X12Generator)  
**Returns**: <code>JSEDINotation</code> - <p>The JS EDI Notation for this instance.</p>  
<a name="X12Generator+setOptions"></a>

### x12Generator.setOptions([options])
<p>Set the serialization options for this instance.</p>

**Kind**: instance method of [<code>X12Generator</code>](#X12Generator)  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Generator+getOptions"></a>

### x12Generator.getOptions() ⇒ [<code>X12SerializationOptions</code>](#X12SerializationOptions)
<p>Get the serialization options for this instance.</p>

**Kind**: instance method of [<code>X12Generator</code>](#X12Generator)  
**Returns**: [<code>X12SerializationOptions</code>](#X12SerializationOptions) - <p>The serialization options for this instance.</p>  
<a name="X12Generator+validate"></a>

### x12Generator.validate() ⇒ [<code>X12Interchange</code>](#X12Interchange)
<p>Validate the EDI in this instance.</p>

**Kind**: instance method of [<code>X12Generator</code>](#X12Generator)  
**Returns**: [<code>X12Interchange</code>](#X12Interchange) - <p>This instance converted to an interchange.</p>  
<a name="X12Generator+toString"></a>

### x12Generator.toString() ⇒ <code>string</code>
<p>Serialize the EDI in this instance.</p>

**Kind**: instance method of [<code>X12Generator</code>](#X12Generator)  
**Returns**: <code>string</code> - <p>This instance converted to an EDI string.</p>  
<a name="X12Interchange"></a>

## X12Interchange
**Kind**: global class  

* [X12Interchange](#X12Interchange)
    * [new X12Interchange([segmentTerminator], [elementDelimiter], [options])](#new_X12Interchange_new)
    * [.setHeader(elements, [options])](#X12Interchange+setHeader)
    * [.addFunctionalGroup([options])](#X12Interchange+addFunctionalGroup) ⇒ [<code>X12FunctionalGroup</code>](#X12FunctionalGroup)
    * [.toString([options])](#X12Interchange+toString) ⇒ <code>string</code>
    * [.toJSEDINotation()](#X12Interchange+toJSEDINotation) ⇒ <code>JSEDINotation</code>
    * [.toJSON()](#X12Interchange+toJSON) ⇒ <code>object</code>

<a name="new_X12Interchange_new"></a>

### new X12Interchange([segmentTerminator], [elementDelimiter], [options])
<p>Create an interchange.</p>


| Param | Type | Description |
| --- | --- | --- |
| [segmentTerminator] | <code>string</code> \| [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>A character to terminate segments when serializing; or an instance of X12SerializationOptions.</p> |
| [elementDelimiter] | <code>string</code> | <p>A character to separate elements when serializing; only required when segmentTerminator is a character.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Interchange+setHeader"></a>

### x12Interchange.setHeader(elements, [options])
<p>Set an ISA header on this interchange.</p>

**Kind**: instance method of [<code>X12Interchange</code>](#X12Interchange)  

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>Array.&lt;string&gt;</code> | <p>An array of elements for an ISA header.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Interchange+addFunctionalGroup"></a>

### x12Interchange.addFunctionalGroup([options]) ⇒ [<code>X12FunctionalGroup</code>](#X12FunctionalGroup)
<p>Add a functional group to this interchange.</p>

**Kind**: instance method of [<code>X12Interchange</code>](#X12Interchange)  
**Returns**: [<code>X12FunctionalGroup</code>](#X12FunctionalGroup) - <p>The functional group added to this interchange.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Interchange+toString"></a>

### x12Interchange.toString([options]) ⇒ <code>string</code>
<p>Serialize interchange to EDI string.</p>

**Kind**: instance method of [<code>X12Interchange</code>](#X12Interchange)  
**Returns**: <code>string</code> - <p>This interchange converted to an EDI string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Interchange+toJSEDINotation"></a>

### x12Interchange.toJSEDINotation() ⇒ <code>JSEDINotation</code>
<p>Serialize interchange to JS EDI Notation object.</p>

**Kind**: instance method of [<code>X12Interchange</code>](#X12Interchange)  
**Returns**: <code>JSEDINotation</code> - <p>This interchange converted to JS EDI Notation object.</p>  
<a name="X12Interchange+toJSON"></a>

### x12Interchange.toJSON() ⇒ <code>object</code>
<p>Serialize interchange to JSON object.</p>

**Kind**: instance method of [<code>X12Interchange</code>](#X12Interchange)  
**Returns**: <code>object</code> - <p>This interchange converted to an object.</p>  
<a name="X12Parser"></a>

## X12Parser
**Kind**: global class  

* [X12Parser](#X12Parser)
    * [new X12Parser([strict])](#new_X12Parser_new)
    * [.parse(edi, [options])](#X12Parser+parse) ⇒ [<code>X12Interchange</code>](#X12Interchange) \| [<code>X12FatInterchange</code>](#X12FatInterchange)

<a name="new_X12Parser_new"></a>

### new X12Parser([strict])
<p>Factory for parsing EDI into interchange object.</p>


| Param | Type | Description |
| --- | --- | --- |
| [strict] | <code>boolean</code> | <p>Set true to strictly follow the EDI spec.</p> |

<a name="X12Parser+parse"></a>

### x12Parser.parse(edi, [options]) ⇒ [<code>X12Interchange</code>](#X12Interchange) \| [<code>X12FatInterchange</code>](#X12FatInterchange)
<p>Parse an EDI document.</p>

**Kind**: instance method of [<code>X12Parser</code>](#X12Parser)  
**Returns**: [<code>X12Interchange</code>](#X12Interchange) \| [<code>X12FatInterchange</code>](#X12FatInterchange) - <p>An interchange or a fat interchange.</p>  

| Param | Type | Description |
| --- | --- | --- |
| edi | <code>string</code> | <p>An ASCII or UTF8 string of EDI to parse.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing from EDI.</p> |

<a name="X12QueryEngine"></a>

## X12QueryEngine
**Kind**: global class  

* [X12QueryEngine](#X12QueryEngine)
    * [new X12QueryEngine([parser])](#new_X12QueryEngine_new)
    * [.query(rawEdi, reference, [defaultValue])](#X12QueryEngine+query) ⇒ [<code>Array.&lt;X12QueryResult&gt;</code>](#X12QueryResult)
    * [.querySingle(rawEdi, reference, [defaultValue])](#X12QueryEngine+querySingle) ⇒ [<code>X12QueryResult</code>](#X12QueryResult)

<a name="new_X12QueryEngine_new"></a>

### new X12QueryEngine([parser])
<p>Factory for querying EDI using the node-x12 object model.</p>


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [parser] | [<code>X12Parser</code>](#X12Parser) \| <code>boolean</code> | <code>true</code> | <p>Pass an external parser or set the strictness of the internal parser.</p> |

<a name="X12QueryEngine+query"></a>

### x12QueryEngine.query(rawEdi, reference, [defaultValue]) ⇒ [<code>Array.&lt;X12QueryResult&gt;</code>](#X12QueryResult)
<p>Query all references in an EDI document.</p>

**Kind**: instance method of [<code>X12QueryEngine</code>](#X12QueryEngine)  
**Returns**: [<code>Array.&lt;X12QueryResult&gt;</code>](#X12QueryResult) - <p>An array of results from the EDI document.</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| rawEdi | <code>string</code> \| [<code>X12Interchange</code>](#X12Interchange) |  | <p>An ASCII or UTF8 string of EDI to parse, or an interchange.</p> |
| reference | <code>string</code> |  | <p>The query string to resolve.</p> |
| [defaultValue] | <code>string</code> | <code>null</code> | <p>A default value to return if result not found.</p> |

<a name="X12QueryEngine+querySingle"></a>

### x12QueryEngine.querySingle(rawEdi, reference, [defaultValue]) ⇒ [<code>X12QueryResult</code>](#X12QueryResult)
<p>Query all references in an EDI document and return the first result.</p>

**Kind**: instance method of [<code>X12QueryEngine</code>](#X12QueryEngine)  
**Returns**: [<code>X12QueryResult</code>](#X12QueryResult) - <p>A result from the EDI document.</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| rawEdi | <code>string</code> \| [<code>X12Interchange</code>](#X12Interchange) |  | <p>An ASCII or UTF8 string of EDI to parse, or an interchange.</p> |
| reference | <code>string</code> |  | <p>The query string to resolve.</p> |
| [defaultValue] | <code>string</code> | <code>null</code> | <p>A default value to return if result not found.</p> |

<a name="X12Segment"></a>

## X12Segment
**Kind**: global class  

* [X12Segment](#X12Segment)
    * [new X12Segment(tag, [options])](#new_X12Segment_new)
    * [.setElements(values)](#X12Segment+setElements)
    * [.addElement(value)](#X12Segment+addElement) ⇒ [<code>X12Element</code>](#X12Element)
    * [.replaceElement(value, segmentPosition)](#X12Segment+replaceElement) ⇒ [<code>X12Element</code>](#X12Element)
    * [.insertElement(value, segmentPosition)](#X12Segment+insertElement) ⇒ [<code>X12Element</code>](#X12Element)
    * [.removeElement(segmentPosition)](#X12Segment+removeElement) ⇒ <code>boolean</code>
    * [.valueOf(segmentPosition, [defaultValue])](#X12Segment+valueOf) ⇒ <code>string</code>
    * [.toString([options])](#X12Segment+toString) ⇒ <code>string</code>
    * [.toJSON()](#X12Segment+toJSON) ⇒ <code>object</code>

<a name="new_X12Segment_new"></a>

### new X12Segment(tag, [options])
<p>Create a segment.</p>


| Param | Type | Description |
| --- | --- | --- |
| tag | <code>string</code> | <p>The tag for this segment.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Segment+setElements"></a>

### x12Segment.setElements(values)
<p>Set the elements of this segment.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  

| Param | Type | Description |
| --- | --- | --- |
| values | <code>Array.&lt;string&gt;</code> | <p>An array of element values.</p> |

<a name="X12Segment+addElement"></a>

### x12Segment.addElement(value) ⇒ [<code>X12Element</code>](#X12Element)
<p>Add an element to this segment.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: [<code>X12Element</code>](#X12Element) - <p>The element that was added to this segment.</p>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | <p>A string value.</p> |

<a name="X12Segment+replaceElement"></a>

### x12Segment.replaceElement(value, segmentPosition) ⇒ [<code>X12Element</code>](#X12Element)
<p>Replace an element at a position in the segment.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: [<code>X12Element</code>](#X12Element) - <p>The new element if successful, or a null if failed.</p>  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | <p>A string value.</p> |
| segmentPosition | <code>number</code> | <p>A 1-based number indicating the position in the segment.</p> |

<a name="X12Segment+insertElement"></a>

### x12Segment.insertElement(value, segmentPosition) ⇒ [<code>X12Element</code>](#X12Element)
<p>Insert an element at a position in the segment.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: [<code>X12Element</code>](#X12Element) - <p>The new element if successful, or a null if failed.</p>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| value | <code>string</code> |  | <p>A string value.</p> |
| segmentPosition | <code>number</code> | <code>1</code> | <p>A 1-based number indicating the position in the segment.</p> |

<a name="X12Segment+removeElement"></a>

### x12Segment.removeElement(segmentPosition) ⇒ <code>boolean</code>
<p>Remove an element at a position in the segment.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: <code>boolean</code> - <p>True if successful.</p>  

| Param | Type | Description |
| --- | --- | --- |
| segmentPosition | <code>number</code> | <p>A 1-based number indicating the position in the segment.</p> |

<a name="X12Segment+valueOf"></a>

### x12Segment.valueOf(segmentPosition, [defaultValue]) ⇒ <code>string</code>
<p>Get the value of an element in this segment.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: <code>string</code> - <p>If no element is at this position, null or the default value will be returned.</p>  

| Param | Type | Description |
| --- | --- | --- |
| segmentPosition | <code>number</code> | <p>A 1-based number indicating the position in the segment.</p> |
| [defaultValue] | <code>string</code> | <p>A default value to return if there is no element found.</p> |

<a name="X12Segment+toString"></a>

### x12Segment.toString([options]) ⇒ <code>string</code>
<p>Serialize segment to EDI string.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: <code>string</code> - <p>This segment converted to an EDI string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Segment+toJSON"></a>

### x12Segment.toJSON() ⇒ <code>object</code>
<p>Serialize transaction set to JSON object.</p>

**Kind**: instance method of [<code>X12Segment</code>](#X12Segment)  
**Returns**: <code>object</code> - <p>This segment converted to an object.</p>  
<a name="X12Transaction"></a>

## X12Transaction
**Kind**: global class  

* [X12Transaction](#X12Transaction)
    * [new X12Transaction([options])](#new_X12Transaction_new)
    * [.setHeader(elements, [options])](#X12Transaction+setHeader)
    * [.addSegment(tag, elements, [options])](#X12Transaction+addSegment) ⇒ [<code>X12Segment</code>](#X12Segment)
    * [.toObject(map, helper)](#X12Transaction+toObject) ⇒ <code>object</code>
    * [.toString([options])](#X12Transaction+toString) ⇒ <code>string</code>
    * [.toJSON()](#X12Transaction+toJSON) ⇒ <code>object</code>

<a name="new_X12Transaction_new"></a>

### new X12Transaction([options])
<p>Create a transaction set.</p>


| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Transaction+setHeader"></a>

### x12Transaction.setHeader(elements, [options])
<p>Set a ST header on this transaction set.</p>

**Kind**: instance method of [<code>X12Transaction</code>](#X12Transaction)  

| Param | Type | Description |
| --- | --- | --- |
| elements | <code>Array.&lt;string&gt;</code> | <p>An array of elements for a ST header.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Transaction+addSegment"></a>

### x12Transaction.addSegment(tag, elements, [options]) ⇒ [<code>X12Segment</code>](#X12Segment)
<p>Add a segment to this transaction set.</p>

**Kind**: instance method of [<code>X12Transaction</code>](#X12Transaction)  
**Returns**: [<code>X12Segment</code>](#X12Segment) - <p>The segment added to this transaction set.</p>  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>string</code> | <p>The tag for this segment.</p> |
| elements | <code>Array.&lt;string&gt;</code> | <p>An array of elements for this segment.</p> |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Transaction+toObject"></a>

### x12Transaction.toObject(map, helper) ⇒ <code>object</code>
<p>Map data from a transaction set to a javascript object.</p>

**Kind**: instance method of [<code>X12Transaction</code>](#X12Transaction)  
**Returns**: <code>object</code> - <p>An object containing resolved values mapped to object keys.</p>  

| Param | Type | Description |
| --- | --- | --- |
| map | <code>object</code> | <p>The javascript object containing keys and querys to resolve.</p> |
| helper | <code>function</code> | <p>A helper function which will be executed on every resolved query value.</p> |

<a name="X12Transaction+toString"></a>

### x12Transaction.toString([options]) ⇒ <code>string</code>
<p>Serialize transaction set to EDI string.</p>

**Kind**: instance method of [<code>X12Transaction</code>](#X12Transaction)  
**Returns**: <code>string</code> - <p>This transaction set converted to an EDI string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing back to EDI.</p> |

<a name="X12Transaction+toJSON"></a>

### x12Transaction.toJSON() ⇒ <code>object</code>
<p>Serialize transaction set to JSON object.</p>

**Kind**: instance method of [<code>X12Transaction</code>](#X12Transaction)  
**Returns**: <code>object</code> - <p>This transaction set converted to an object.</p>  
<a name="X12TransactionMap"></a>

## X12TransactionMap
**Kind**: global class  

* [X12TransactionMap](#X12TransactionMap)
    * [new X12TransactionMap(map, [transaction], helper)](#new_X12TransactionMap_new)
    * [.setTransaction(transaction, helper)](#X12TransactionMap+setTransaction)
    * [.toObject(map, [callback])](#X12TransactionMap+toObject) ⇒ <code>object</code> \| <code>Array.&lt;object&gt;</code>

<a name="new_X12TransactionMap_new"></a>

### new X12TransactionMap(map, [transaction], helper)
<p>Factory for mapping transaction set data to javascript object map.</p>


| Param | Type | Description |
| --- | --- | --- |
| map | <code>object</code> | <p>The javascript object containing keys and querys to resolve.</p> |
| [transaction] | [<code>X12Transaction</code>](#X12Transaction) | <p>A transaction set to map.</p> |
| helper | <code>function</code> | <p>A helper function which will be executed on every resolved query value.</p> |

<a name="X12TransactionMap+setTransaction"></a>

### x12TransactionMap.setTransaction(transaction, helper)
<p>Set the transaction set to map and optionally a helper function.</p>

**Kind**: instance method of [<code>X12TransactionMap</code>](#X12TransactionMap)  

| Param | Type | Description |
| --- | --- | --- |
| transaction | [<code>X12Transaction</code>](#X12Transaction) | <p>A transaction set to map.</p> |
| helper | <code>function</code> | <p>A helper function which will be executed on every resolved query value.</p> |

<a name="X12TransactionMap+toObject"></a>

### x12TransactionMap.toObject(map, [callback]) ⇒ <code>object</code> \| <code>Array.&lt;object&gt;</code>
<p>Map data from the transaction set to a javascript object.</p>

**Kind**: instance method of [<code>X12TransactionMap</code>](#X12TransactionMap)  
**Returns**: <code>object</code> \| <code>Array.&lt;object&gt;</code> - <p>The transaction set mapped to an object or an array of objects.</p>  

| Param | Type | Description |
| --- | --- | --- |
| map | <code>object</code> | <p>The javascript object containing keys and querys to resolve.</p> |
| [callback] | <code>function</code> | <p>A callback function which will be passed to the helper function.</p> |

<a name="defaultSerializationOptions"></a>

## defaultSerializationOptions([options]) ⇒ [<code>X12SerializationOptions</code>](#X12SerializationOptions)
<p>Set default values for any missing X12SerializationOptions in an options object.</p>

**Kind**: global function  
**Returns**: [<code>X12SerializationOptions</code>](#X12SerializationOptions) - <p>Serialization options with defaults filled in.</p>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>X12SerializationOptions</code>](#X12SerializationOptions) | <p>Options for serializing to and from EDI.</p> |

<a name="X12QueryResult"></a>

## X12QueryResult : <code>object</code>
<p>A result as resolved by the query engine.</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| interchange | [<code>X12Interchange</code>](#X12Interchange) |  | 
| functionalGroup | [<code>X12FunctionalGroup</code>](#X12FunctionalGroup) |  | 
| transaction | [<code>X12Transaction</code>](#X12Transaction) |  | 
| segment | [<code>X12Segment</code>](#X12Segment) |  | 
| element | [<code>X12Element</code>](#X12Element) |  | 
| [value] | <code>string</code> | <code>null</code> | 
| [values] | <code>Array.&lt;(string\|Array.&lt;string&gt;)&gt;</code> | <code>[]</code> | 

<a name="X12SerializationOptions"></a>

## X12SerializationOptions : <code>object</code>
<p>Options for serializing to and from EDI.</p>

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| [elementDelimiter] | <code>string</code> | 
| [endOfLine] | <code>string</code> | 
| [format] | <code>boolean</code> | 
| [segmentTerminator] | <code>string</code> | 
| [subElementDelimiter] | <code>string</code> | 

