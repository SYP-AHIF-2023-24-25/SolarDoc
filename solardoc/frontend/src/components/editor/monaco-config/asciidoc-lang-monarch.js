export default {
    tokenizer: {
        root: [
            [/^(={1,6})\s+.+$/, "header"], // AsciiDoc's headers denoted by ==
            [/\*_[^*]+_\*/, "bold-italic"], // text that's bold and italic at the same time
            [/^[*]\s\[(\s|[*]|x)]\s.+/,"check-boxes"],// check boxes like this * [ ] or * [x] or [*]
            [/\*{1,3}[^*]+\*{1,3}/, "bold"], // Bold text between * or ** or ***
            [/_{1,3}[^_]+_{1,3}/, "italic"], // Italic text between _ or __ or ___
            [/\[[^\]]+]/, "link"], // Links denoted by [text]
            [/^([.]+)\s+.+$/, "unordered"], // unordered lists
            [/^([*]+)\s+.+$/, "ordered"], // ordered lists
            [/\/\/.+/, "comment"],
            [/:.+:/, "special-token"], // for setting themes in reveal.js and attribute entries

            //multi line rule
            { regex: /``/, action: { token: "code", next: "@codeblock" } },
            { regex: /----/, action: { token: "code", next: "@sourceblock" } },
        ],
        codeblock: [
            // Content inside the code block
            { regex: /[^`]+/, action: { token: "code.content" } },
            // End of the code block (double backticks)
            { regex: /``/, action: { token: "code", next: "@pop" } },
            // Other rules for code block content
        ],
        sourceblock:[
            { regex: /[^-]+/, action: { token: "code.content" } },
            // End of the code block (double backticks)
            { regex: /----/, action: { token: "code", next: "@pop" } },
        ]
    }
};
