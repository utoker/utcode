(this.webpackJsonputcode=this.webpackJsonputcode||[]).push([[195],{406:function(e,n){!function(e){var n=e.languages.javadoclike={parameter:{pattern:/(^\s*(?:\/{3}|\*|\/\*\*)\s*@(?:param|arg|arguments)\s+)\w+/m,lookbehind:!0},keyword:{pattern:/(^\s*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,lookbehind:!0},punctuation:/[{}]/};Object.defineProperty(n,"addSupport",{value:function(n,a){"string"==typeof n&&(n=[n]),n.forEach((function(n){!function(n,a){var t="doc-comment",o=e.languages[n];if(o){var i=o[t];if(!i){i=(o=e.languages.insertBefore(n,"comment",{"doc-comment":{pattern:/(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,lookbehind:!0,alias:"comment"}}))[t]}if(i instanceof RegExp&&(i=o[t]={pattern:i}),Array.isArray(i))for(var r=0,s=i.length;r<s;r++)i[r]instanceof RegExp&&(i[r]={pattern:i[r]}),a(i[r]);else a(i)}}(n,(function(e){e.inside||(e.inside={}),e.inside.rest=a}))}))}}),n.addSupport(["java","javascript","php"],n)}(Prism)}}]);
//# sourceMappingURL=195.3f593871.chunk.js.map