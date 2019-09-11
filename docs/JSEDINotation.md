## JavaScript EDI Notation
Node-X12 defines a simplified hierarchical object model for EDI objects called **JavaScript EDI Notation**. This object model is used for generating valid EDI in the `X12Generator` class, and for calling `JSON.stringify` on members of the X12 object model. The major difference is that the X12 object model is a **complete** description of an EDI file, while this notation only retains the data necessary to exchange EDI to and from JSON.

### Format
Each level in the hierarchy has two properties. A container object will have two array properties. At the bottom level of the hierarchy are the segments of a transaction set; these segments have a tag and a string array.

The top level of the hierarchy also optionally allows to define the control characters.

### Hierarchy
The hierarchy of JavaScript EDI Notation closely follows the X12 object model.
- Root {object}
    - options {object}
    - header {Array&lt;string&gt;}
    - functionalGroups {Array&lt;FunctionalGroup&gt;}

- FunctionalGroup {object}
    - header {Array&lt;string&gt;}
    - transactions {Array&lt;Transaction&gt;}

- Transaction {object}
    - header {Array&lt;string&gt;}
    - segments {Array&lt;Segment&gt;}

- Segment {object}
    - tag {string}
    - elements {Array&lt;string&gt;}

### ASC X12 Headers and Trailers
The following ASC X12 headers are interpreted to and from headers in the hierarchy. Trailers are dynamically generated based on properties of the level.
- ISA: Root level
- GS: FunctionalGroup level
- ST: Transaction level

### Sample JS EDI Notation
A sample 856 generated from test [document](/tests/test-data/856.edi).
```json
{
    "header": [
        "01",
        "0000000000",
        "01",
        "ABCCO     ",
        "12",
        "4405197800     ",
        "01",
        "999999999      ",
        "111206",
        "1719",
        "-",
        "00406",
        "000000049",
        "0",
        "P",
        ">"
    ],
    "options": {
        "segmentTerminator": "~",
        "elementDelimiter": "*",
        "endOfLine": "\n",
        "format": false,
        "subElementDelimiter": ">"
    },
    "functionalGroups": [
        {
            "header": [
                "SH",
                "4405197800",
                "999999999",
                "20111206",
                "1045",
                "49",
                "X",
                "004060"
            ],
            "transactions": [
                {
                    "header": [
                        "856",
                        "0008"
                    ],
                    "segments": [
                        {
                            "tag": "BSN",
                            "elements": [
                                "14",
                                "829716",
                                "20111206",
                                "142428",
                                "0002"
                            ]
                        },
                        {
                            "tag": "HL",
                            "elements": [
                                "1",
                                "",
                                "S"
                            ]
                        },
                        {
                            "tag": "TD1",
                            "elements": [
                                "PCS",
                                "2",
                                "",
                                "",
                                "",
                                "A3",
                                "60.310",
                                "LB"
                            ]
                        },
                        {
                            "tag": "TD5",
                            "elements": [
                                "",
                                "2",
                                "XXXX",
                                "",
                                "XXXX"
                            ]
                        },
                        {
                            "tag": "REF",
                            "elements": [
                                "BM",
                                "999999-001"
                            ]
                        },
                        {
                            "tag": "REF",
                            "elements": [
                                "CN",
                                "5787970539"
                            ]
                        },
                        {
                            "tag": "DTM",
                            "elements": [
                                "011",
                                "20111206"
                            ]
                        },
                        {
                            "tag": "N1",
                            "elements": [
                                "SH",
                                "1 EDI SOURCE"
                            ]
                        },
                        {
                            "tag": "N3",
                            "elements": [
                                "31875 SOLON RD"
                            ]
                        },
                        {
                            "tag": "N4",
                            "elements": [
                                "SOLON",
                                "OH",
                                "44139"
                            ]
                        },
                        {
                            "tag": "N1",
                            "elements": [
                                "OB",
                                "XYZ RETAIL"
                            ]
                        },
                        {
                            "tag": "N3",
                            "elements": [
                                "P O BOX 9999999"
                            ]
                        },
                        {
                            "tag": "N4",
                            "elements": [
                                "ATLANTA",
                                "GA",
                                "31139-0020",
                                "",
                                "SN",
                                "9999"
                            ]
                        },
                        {
                            "tag": "N1",
                            "elements": [
                                "SF",
                                "1 EDI SOURCE"
                            ]
                        },
                        {
                            "tag": "N3",
                            "elements": [
                                "31875 SOLON ROAD"
                            ]
                        },
                        {
                            "tag": "N4",
                            "elements": [
                                "SOLON",
                                "OH",
                                "44139"
                            ]
                        },
                        {
                            "tag": "HL",
                            "elements": [
                                "2",
                                "1",
                                "O"
                            ]
                        },
                        {
                            "tag": "PRF",
                            "elements": [
                                "99999817",
                                "",
                                "",
                                "20111205"
                            ]
                        },
                        {
                            "tag": "HL",
                            "elements": [
                                "3",
                                "2",
                                "I"
                            ]
                        },
                        {
                            "tag": "LIN",
                            "elements": [
                                "1",
                                "VP",
                                "87787D",
                                "UP",
                                "999999310145"
                            ]
                        },
                        {
                            "tag": "SN1",
                            "elements": [
                                "1",
                                "24",
                                "EA"
                            ]
                        },
                        {
                            "tag": "PO4",
                            "elements": [
                                "1",
                                "24",
                                "EA"
                            ]
                        },
                        {
                            "tag": "PID",
                            "elements": [
                                "F",
                                "",
                                "",
                                "",
                                "BLUE WIDGET"
                            ]
                        },
                        {
                            "tag": "HL",
                            "elements": [
                                "4",
                                "2",
                                "I"
                            ]
                        },
                        {
                            "tag": "LIN",
                            "elements": [
                                "2",
                                "VP",
                                "99887D",
                                "UP",
                                "999999311746"
                            ]
                        },
                        {
                            "tag": "SN1",
                            "elements": [
                                "2",
                                "6",
                                "EA"
                            ]
                        },
                        {
                            "tag": "PO4",
                            "elements": [
                                "1",
                                "6",
                                "EA"
                            ]
                        },
                        {
                            "tag": "PID",
                            "elements": [
                                "F",
                                "",
                                "",
                                "",
                                "RED WIDGET"
                            ]
                        },
                        {
                            "tag": "CTT",
                            "elements": [
                                "4",
                                "30"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
```