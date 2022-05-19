function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') {
    return;
  }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".JSXElement.JSXIdentifier{color:#4169e1}.JSXElement.JSXBracket{color:#ff8c00}.JSXElement.JSXText{color:#b8860b}.JSXElement.JSXGlyph{background:cyan;opacity:.25}.JSXClosingFragment.JSXBracket,.JSXOpeningElement.JSXBracket,.JSXOpeningFragment.JSXBracket{color:#ff8c00;font-weight:700}.JSXOpeningElement.JSXIdentifier{color:#4169e1}.JSXClosingElement.JSXBracket{color:#ff8c00;font-weight:lighter}.JSXClosingElement.JSXIdentifier{color:#4169e1;font-weight:lighter}.JSXAttribute.JSXIdentifier{color:#4682b4}.JSXExpressionContainer.JSXBracket,.JSXSpreadAttribute.JSXBracket,.JSXSpreadChild.JSXBracket{color:#ff8c00}";
styleInject(css_248z);

const collectJSXExpressions = (ast, traverse, traverseOptions = {}) => {
  const jsxExpressions = [];
  const enter = path => {
    if (path.type.toUpperCase().includes("JSX")) {
      jsxExpressions.push(path);
    }
  };
  traverse(ast, { ...traverseOptions,
    enter
  });
  return jsxExpressions;
};
const isJSXIdentifier = path => {
  return path && (path.key === 'object' || path.key === 'property' || path.key === 'name' || path.key === 'namespace');
};
const isParentJSXAttribute = path => {
  return path && path.parentPath && path.parentPath.isJSXAttribute();
};
const getLoc = path => {
  return path && path.node && path.node.loc;
};
const cloneLoc = path => {
  const loc = getLoc(path);
  if (!loc) {
    return null;
  }
  return {
    start: { ...loc.start
    },
    end: { ...loc.end
    }
  };
};
const getCuratedLoc = path => {
  const loc = cloneLoc(path);
  if (!loc) {
    return [null, null, null, null];
  }
  if (path.key === 'object' && path.container) {
    loc.end = { ...path.container.property.loc.start
    };
  }
  return loc;
};
const extractJSXOpeningElement = path => {
  const loc = getLoc(path);
  if (!loc) {
    return [null, null, null, null];
  }
  const openingElement = path.node.openingElement;
  if (!openingElement) {
    return [null, null, null, null];
  }
  const elementName = openingElement.name.name;
  const startLoc = {
    start: { ...openingElement.loc.start
    },
    end: { ...openingElement.name.loc.start
    }
  };
  const endLoc = {
    start: { ...openingElement.loc.end
    },
    end: { ...openingElement.loc.end
    }
  };
  endLoc.start.column--;
  if (openingElement.selfClosing) {
    endLoc.start.column--;
  }
  return [openingElement, elementName, startLoc, endLoc];
};
const extractJSXClosingElement = path => {
  const loc = getLoc(path);
  if (!loc) {
    return [null, null, null, null];
  }
  const closingElement = path.node.closingElement;
  if (!closingElement) {
    return [null, null, null, null];
  }
  const elementName = closingElement.name && closingElement.name.name;
  const startLoc = {
    start: { ...closingElement.loc.start
    },
    end: { ...closingElement.name.loc.start
    }
  };
  const endLoc = {
    start: { ...closingElement.loc.end
    },
    end: { ...closingElement.loc.end
    }
  };
  endLoc.start.column--;
  return [closingElement, elementName, startLoc, endLoc];
};
const extractJSXExpressionEdges = path => {
  const loc = getLoc(path);
  if (!loc) {
    return [null, null, null, null];
  }
  let innerNode = null;
  let innerLocKey = path.isJSXSpreadChild() ? 'expression' : path.isJSXSpreadAttribute() ? 'argument' : null;
  let innerLoc = null;
  if (innerLocKey) {
    innerNode = path.node[innerLocKey];
    innerLoc = {
      start: { ...innerNode.loc.start
      },
      end: { ...innerNode.loc.end
      }
    };
    if (innerNode.extra && innerNode.extra.parenthesized) {
      innerLoc.start.column--;
      innerLoc.end.column++;
    }
  } else {
    innerLoc = {
      start: { ...loc.start
      },
      end: { ...loc.end
      }
    };
    innerLoc.start.column++;
    innerLoc.end.column--;
  }
  const startEdgeLoc = {
    start: { ...loc.start
    },
    end: { ...innerLoc.start
    }
  };
  const endEdgeLoc = {
    start: { ...innerLoc.end
    },
    end: { ...loc.end
    }
  };
  return [innerNode, innerLocKey, startEdgeLoc, endEdgeLoc];
};

const COMMENT_ACTION_ID = "editor.action.commentLine";
const configureLoc2Range = (monaco, parserType = 'babel') => {
  switch (parserType) {
    case 'babel':
    default:
      return (loc, startLineOffset = 0, startColumnOffset = 0, endLineOffset = 0, endColumnOffset = 0) => {
        if (!loc || !loc.start) {
          return new monaco.Range(1, 1, 1, 1);
        }
        return new monaco.Range(startLineOffset + loc.start.line, startColumnOffset + loc.start.column + 1, endLineOffset + loc.end ? loc.end.line : loc.start.line, endColumnOffset + loc.end ? loc.end.column + 1 : loc.start.column + 1);
      };
  }
};
const configureRange2Loc = (parserType = 'babel') => {
  switch (parserType) {
    case 'babel':
    default:
      return (rangeOrPosition, startLineOffset = 0, startColumnOffset = 0, endLineOffset = 0, endColumnOffset = 0) => {
        const loc = {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 0
          }
        };
        if (!rangeOrPosition) {
          return loc;
        }
        if (rangeOrPosition.lineNumber) {
          loc.start.line = startLineOffset + rangeOrPosition.lineNumber;
          loc.start.column = startColumnOffset + rangeOrPosition.column - 1;
          loc.end.line = endLineOffset + rangeOrPosition.lineNumber;
          loc.end.column = endColumnOffset + rangeOrPosition.column - 1;
        } else {
          loc.start.line = startLineOffset + rangeOrPosition.startLineNumber;
          loc.start.column = startColumnOffset + rangeOrPosition.startColumn - 1;
          loc.end.line = endLineOffset + rangeOrPosition.endLineNumber;
          loc.end.column = endColumnOffset + rangeOrPosition.endColumn - 1;
        }
        return loc;
      };
  }
};
class MonacoEditorManager {
  constructor(monacoEditor, monaco, loc2Range) {
    this.monacoEditor = monacoEditor;
    this.monaco = monaco;
    this.loc2Range = loc2Range || configureRange2Loc(monaco);
    this.runEditorCommentLineAction = () => {
      return this.monacoEditor.getAction(COMMENT_ACTION_ID).run();
    };
    this.getLineIndentationColumn = lineNumber => {
      return this.monacoEditor.getModel().getLineFirstNonWhitespaceColumn(lineNumber);
    };
    this.getCommentableStartingRange = range => {
      const startColumn = this.getLineIndentationColumn(range.startLineNumber);
      const commentableRange = new this.monaco.Range(range.startLineNumber, startColumn, range.startLineNumber, startColumn);
      return commentableRange;
    };
    this.getCommentContainingStartingRange = range => {
      let startColumn = this.getLineIndentationColumn(range.startLineNumber);
      startColumn = startColumn ? startColumn - 1 : 0;
      const containingRange = new this.monaco.Range(range.startLineNumber, startColumn, range.startLineNumber, startColumn);
      return containingRange;
    };
    this.getSelectionFirstLineText = () => {
      const model = this.monacoEditor.getModel();
      const {
        startLineNumber
      } = this.monacoEditor.getSelection();
      const jsCommentRange = new this.monaco.Range(startLineNumber, this.getLineIndentationColumn(startLineNumber), startLineNumber, model.getLineMaxColumn(startLineNumber));
      return model.getValueInRange(jsCommentRange);
    };
  }
}

const prepareOptions = (path, jsxTypeOptions = {}, highlighterOptions = {}) => {
  return highlighterOptions.iShowHover ? { ...jsxTypeOptions,
    ...{
      hoverMessage: `(${path.type})`
    }
  } : jsxTypeOptions;
};
const HIGHLIGHT_TYPE = {
  ELEMENT: 'ELEMENT',
  ALL: 'ALL',
  IDENTIFIER: 'IDENTIFIER',
  EDGE: 'EDGE',
  STYLE: 'STYLE'
};
const HIGHLIGHT_MODE = {
  [HIGHLIGHT_TYPE.ELEMENT]: (path, jsxTypeOptions, highlighterOptions) => {
    const [openingElement, elementName, startLoc, endLoc] = extractJSXOpeningElement(path);
    const result = [];
    if (openingElement) {
      result.push([startLoc, highlighterOptions.isUseSeparateElementStyles ? JSXTypes.JSXBracket.openingElementOptions : JSXTypes.JSXBracket.options]);
      result.push([endLoc, highlighterOptions.isUseSeparateElementStyles ? JSXTypes.JSXBracket.openingElementOptions : JSXTypes.JSXBracket.options]);
    }
    const [closingElement,, closingElementStartLoc, closingElementEndLoc] = extractJSXClosingElement(path);
    if (closingElement) {
      result.push([closingElementStartLoc, highlighterOptions.isUseSeparateElementStyles ? JSXTypes.JSXBracket.closingElementOptions : JSXTypes.JSXBracket.options]);
      result.push([closingElementEndLoc, highlighterOptions.isUseSeparateElementStyles ? JSXTypes.JSXBracket.closingElementOptions : JSXTypes.JSXBracket.options]);
    }
    const loc = getLoc(path);
    highlighterOptions.isHighlightGlyph && result.push([loc, JSXTypes.JSXElement.options(elementName)]);
    return result;
  },
  [HIGHLIGHT_TYPE.ALL]: (path, jsxTypeOptions, highlighterOptions) => {
    const curatedLoc = getCuratedLoc(path);
    const result = [];
    curatedLoc && result.push([curatedLoc, prepareOptions(path, jsxTypeOptions, highlighterOptions)]);
    return result;
  },
  [HIGHLIGHT_TYPE.IDENTIFIER]: (path, jsxTypeOptions, highlighterOptions) => {
    if (!isJSXIdentifier(path)) {
      return [];
    }
    return HIGHLIGHT_MODE[HIGHLIGHT_TYPE.ALL](path, isParentJSXAttribute(path) ? JSXTypes.JSXAttribute.options : jsxTypeOptions, highlighterOptions);
  },
  [HIGHLIGHT_TYPE.EDGE]: (path, jsxTypeOptions, highlighterOptions) => {
    const options = prepareOptions(path, jsxTypeOptions, highlighterOptions);
    const [,, startEdgeLoc, endEdgeLoc] = extractJSXExpressionEdges(path);
    const result = [];
    result.push([startEdgeLoc, options]);
    result.push([endEdgeLoc, options]);
    return result;
  },
  [HIGHLIGHT_TYPE.STYLE]: () => []
};
const JSXTypes = {
  JSXIdentifier: {
    highlightScope: HIGHLIGHT_TYPE.IDENTIFIER,
    options: {
      inlineClassName: 'JSXElement.JSXIdentifier'
    }
  },
  JSXOpeningFragment: {
    highlightScope: HIGHLIGHT_TYPE.ALL,
    options: {
      inlineClassName: 'JSXOpeningFragment.JSXBracket'
    }
  },
  JSXClosingFragment: {
    highlightScope: HIGHLIGHT_TYPE.ALL,
    options: {
      inlineClassName: 'JSXClosingFragment.JSXBracket'
    }
  },
  JSXText: {
    highlightScope: HIGHLIGHT_TYPE.ALL,
    options: {
      inlineClassName: 'JSXElement.JSXText'
    }
  },
  JSXExpressionContainer: {
    highlightScope: HIGHLIGHT_TYPE.EDGE,
    options: {
      inlineClassName: 'JSXExpressionContainer.JSXBracket'
    }
  },
  JSXSpreadChild: {
    highlightScope: HIGHLIGHT_TYPE.EDGE,
    options: {
      inlineClassName: 'JSXSpreadChild.JSXBracket'
    }
  },
  JSXSpreadAttribute: {
    highlightScope: HIGHLIGHT_TYPE.EDGE,
    options: {
      inlineClassName: 'JSXSpreadAttribute.JSXBracket'
    }
  },
  JSXElement: {
    highlightScope: HIGHLIGHT_TYPE.ELEMENT,
    options: elementName => ({
      glyphMarginClassName: 'JSXElement.JSXGlyph',
      glyphMarginHoverMessage: `JSX Element${elementName ? ': ' + elementName : ''}`
    })
  },
  JSXBracket: {
    highlightScope: HIGHLIGHT_TYPE.STYLE,
    options: {
      inlineClassName: 'JSXElement.JSXBracket'
    },
    openingElementOptions: {
      inlineClassName: 'JSXOpeningElement.JSXBracket'
    },
    closingElementOptions: {
      inlineClassName: 'JSXClosingElement.JSXBracket'
    }
  },
  JSXOpeningElement: {
    highlightScope: HIGHLIGHT_TYPE.STYLE,
    options: {
      inlineClassName: 'JSXOpeningElement.JSXIdentifier'
    }
  },
  JSXClosingElement: {
    highlightScope: HIGHLIGHT_TYPE.STYLE,
    options: {
      inlineClassName: 'JSXClosingElement.JSXIdentifier'
    }
  },
  JSXAttribute: {
    highlightScope: HIGHLIGHT_TYPE.STYLE,
    options: {
      inlineClassName: 'JSXAttribute.JSXIdentifier'
    }
  }
};
class DecoratorMapper {
  constructor(monacoEditor, loc2Range, _JSXTypes = JSXTypes) {
    let decorators = [];
    let jsxDecoratorIds = [];
    const addDecorator = ([loc, options]) => {
      return decorators.push({
        range: loc2Range(loc),
        options
      });
    };
    const deltaDecorations = () => {
      jsxDecoratorIds = monacoEditor.deltaDecorations(jsxDecoratorIds || [], decorators);
      decorators = [];
      return jsxDecoratorIds;
    };
    this.deltaJSXDecorations = (jsxExpressions, options) => {
      for (const jsxType in _JSXTypes) {
        jsxExpressions.filter(path => path.type === jsxType).forEach(path => HIGHLIGHT_MODE[_JSXTypes[jsxType].highlightScope](path, _JSXTypes[jsxType].options, options).forEach(entry => addDecorator(entry)));
      }
      return deltaDecorations();
    };
    this.reset = () => {
      decorators = [];
      deltaDecorations();
    };
    this.reset();
  }
}

const JSXCommentContexts = {
  JS: 'JS',
  JSX: 'JSX'
};
function getJSXContext(jsxExpressions, commentableRange, commentContainingRange, loc2Range) {
  if (!(jsxExpressions && commentableRange && commentContainingRange && loc2Range)) {
    return JSXCommentContexts.JS;
  }
  let minRange = null;
  let minCommentableRange = null;
  let path = null;
  let commentablePath = null;
  jsxExpressions.forEach(p => {
    const jsxRange = loc2Range(p.node.loc);
    if ((p.key === 'name' || p.key === 'property') && p.isJSXIdentifier() && jsxRange.intersectRanges(commentableRange)) {
      if (!minCommentableRange || minCommentableRange.containsRange(jsxRange)) {
        minCommentableRange = jsxRange;
        commentablePath = p;
      }
    }
    if (jsxRange.intersectRanges(commentContainingRange)) {
      if (!minRange || minRange.containsRange(jsxRange)) {
        minRange = jsxRange;
        path = p;
      }
    }
  });
  if (!path || path.isJSXExpressionContainer() || commentablePath) {
    return JSXCommentContexts.JS;
  } else {
    return JSXCommentContexts.JSX;
  }
}
class Commenter {
  constructor(monacoEditorManager, parseJSXExpressionsPromise) {
    let _editorCommandId = null;
    this.getEditorCommandId = () => {
      return _editorCommandId;
    };
    let _isJSXCommentCommandActive = false;
    this.isJSXCommentCommandActive = () => {
      return _isJSXCommentCommandActive;
    };
    const editorCommandOnDispose = () => {
      _isJSXCommentCommandActive = false;
    };
    this.runJsxCommentAction = (selection, commentContext) => {
      const {
        monacoEditor,
        monaco,
        runEditorCommentLineAction,
        getSelectionFirstLineText
      } = monacoEditorManager;
      const jsCommentText = getSelectionFirstLineText();
      if (jsCommentText.match(/^\s*\/[/*]/)) {
        runEditorCommentLineAction();
        return;
      }
      const model = monacoEditor.getModel();
      let isUnCommentAction = true;
      const commentsData = [];
      for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
        const commentRange = new monaco.Range(i, model.getLineFirstNonWhitespaceColumn(i), i, model.getLineMaxColumn(i));
        const commentText = model.getValueInRange(commentRange);
        commentsData.push({
          commentRange,
          commentText
        });
        isUnCommentAction = isUnCommentAction && !!commentText.match(/{\/\*/);
      }
      if (commentContext !== JSXCommentContexts.JSX && !isUnCommentAction) {
        runEditorCommentLineAction();
        return;
      }
      let editOperations = [];
      let commentsDataIndex = 0;
      for (let i = selection.startLineNumber; i <= selection.endLineNumber; i++) {
        let {
          commentText,
          commentRange
        } = commentsData[commentsDataIndex++];
        if (isUnCommentAction) {
          commentText = commentText.replace(/{\/\*/, '');
          commentText = commentText.replace(/\*\/}/, '');
        } else {
          commentText = `{/*${commentText}*/}`;
        }
        editOperations.push({
          identifier: {
            major: 1,
            minor: 1
          },
          range: commentRange,
          text: commentText,
          forceMoveMarkers: true
        });
      }
      editOperations.length && monacoEditor.executeEdits(_editorCommandId, editOperations);
    };
    this.addJSXCommentCommand = () => {
      const {
        monacoEditor,
        monaco,
        loc2Range,
        runEditorCommentLineAction,
        getCommentableStartingRange,
        getCommentContainingStartingRange
      } = monacoEditorManager;
      if (_editorCommandId) {
        _isJSXCommentCommandActive = true;
        return editorCommandOnDispose;
      }
      _editorCommandId = monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_SLASH, () => {
        if (!_isJSXCommentCommandActive) {
          runEditorCommentLineAction();
          return;
        }
        parseJSXExpressionsPromise().then(jsxExpressions => {
          const selection = monacoEditor.getSelection();
          const commentContext = getJSXContext(jsxExpressions, getCommentableStartingRange(selection), getCommentContainingStartingRange(selection), loc2Range);
          this.runJsxCommentAction(selection, commentContext);
        }).catch(() => {
          runEditorCommentLineAction();
        });
      });
      _isJSXCommentCommandActive = true;
      monacoEditor.onDidDispose(editorCommandOnDispose);
      return editorCommandOnDispose;
    };
  }
}

const defaultOptions = {
  parser: 'babel',
  isHighlightGlyph: false,
  iShowHover: false,
  isUseSeparateElementStyles: false,
  jsxCommenter: null,
  monacoEditorManager: null,
  decoratorMapper: null
};
const makeGetAstPromise = (parse, monacoEditor) => () => {
  return new Promise((resolve, reject) => {
    try {
      return resolve(parse(monacoEditor.getValue())
      );
    } catch (e) {
      return reject(e);
    }
  });
};
const makeParseJSXExpressionsPromise = (traverse, getAstPromise, _collectJSXExpressions = collectJSXExpressions) => () => {
  return new Promise((resolve, reject) => {
    getAstPromise().then(ast => {
      try {
        return resolve(_collectJSXExpressions(ast, traverse));
      } catch (e) {
        return reject(e);
      }
    }).catch(e => reject(e));
  });
};
const makeJSXCommenterBundle = (monaco, parse, traverse, monacoEditor, options = {}) => {
  const {
    parserType,
    jsxCommenter,
    monacoEditorManager
  } = options;
  const range2Loc = configureRange2Loc(parserType);
  const loc2Range = configureLoc2Range(monaco, parserType);
  const getAstPromise = makeGetAstPromise(parse, monacoEditor);
  const parseJSXExpressionsPromise = makeParseJSXExpressionsPromise(traverse, getAstPromise);
  const _monacoEditorManager = monacoEditorManager || new MonacoEditorManager(monacoEditor, monaco, loc2Range);
  const _jsxCommenter = jsxCommenter || new Commenter(_monacoEditorManager, parseJSXExpressionsPromise);
  return [_jsxCommenter, _monacoEditorManager, parseJSXExpressionsPromise, getAstPromise, loc2Range, range2Loc];
};
const makeBabelParse = parse => {
  return (code, options = {}) => {
    return parse(code, { ...options,
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true
    });
  };
};
class MonacoJSXHighlighter {
  constructor(monaco, parse, traverse, monacoEditor, options = {}) {
    this.options = { ...defaultOptions,
      ...options
    };
    const {
      jsxCommenter,
      monacoEditorManager,
      decoratorMapper
    } = this.options;
    this.babelParse = makeBabelParse(parse);
    const [_jsxCommenter, _monacoEditorManager, parseJSXExpressionsPromise, getAstPromise, loc2Range, range2Loc] = makeJSXCommenterBundle(monaco, this.babelParse, traverse, monacoEditor, this.options);
    this.jsxCommenter = jsxCommenter || _jsxCommenter;
    this.monacoEditorManager = monacoEditorManager || _monacoEditorManager;
    this.parseJSXExpressionsPromise = parseJSXExpressionsPromise;
    this.getAstPromise = getAstPromise;
    this.loc2Range = loc2Range;
    this.range2Loc = range2Loc;
    this.addJSXCommentCommand = this.jsxCommenter.addJSXCommentCommand;
    this.decoratorMapper = decoratorMapper || new DecoratorMapper(monacoEditor, this.loc2Range);
    this.decoratorMapperReset = () => {
      decoratorMapper.reset();
    };
    this.highlight = (ast, _collectJSXExpressions = collectJSXExpressions) => {
      return new Promise((resolve, reject) => {
        const {
          decoratorMapper,
          options
        } = this;
        const result = {
          decoratorMapper,
          options,
          ast,
          jsxExpressions: []
        };
        if (!ast) {
          return resolve(result);
        }
        try {
          const jsxExpressions = _collectJSXExpressions(ast, traverse);
          decoratorMapper.deltaJSXDecorations(jsxExpressions, options);
          result.jsxExpressions = jsxExpressions;
          return resolve(result);
        } catch (e) {
          return reject(e);
        }
      });
    };
    this.highlightCode = (afterHighlight = ast => ast, onHighlightError = error => error, getAstPromise = this.getAstPromise, onGetAstError = error => error) => {
      return getAstPromise().then(ast => {
        this.highlight(ast).then(afterHighlight).catch(onHighlightError);
      }).catch(onGetAstError);
    };
    let _isHighlightBoundToModelContentChanges = false;
    this.isHighlightBoundToModelContentChanges = () => _isHighlightBoundToModelContentChanges;
    this.highlightOnDidChangeModelContent = (debounceTime = 100, afterHighlight = ast => ast, onHighlightError = error => error, getAstPromise = this.getAstPromise, onParseAstError = error => error) => {
      const highlightCallback = () => {
        return this.highlightCode(afterHighlight, onHighlightError, getAstPromise, onParseAstError);
      };
      highlightCallback();
      let tid = null;
      let highlighterDisposer = {
        onDidChangeModelContentDisposer: monacoEditor.onDidChangeModelContent(() => {
          clearTimeout(tid);
          tid = setTimeout(highlightCallback, debounceTime);
        }),
        onDidChangeModelDisposer: monacoEditor.onDidChangeModel(() => {
          highlightCallback();
        })
      };
      highlighterDisposer.dispose = () => {
        highlighterDisposer.onDidChangeModelContentDisposer.dispose();
        highlighterDisposer.onDidChangeModelDisposer.dispose();
      };
      _isHighlightBoundToModelContentChanges = true;
      const onDispose = () => {
        this.decoratorMapper.reset();
        if (!_isHighlightBoundToModelContentChanges) {
          return;
        }
        _isHighlightBoundToModelContentChanges = false;
        highlighterDisposer && highlighterDisposer.dispose();
        highlighterDisposer = null;
      };
      monacoEditor.onDidDispose(() => {
        this.decoratorMapper.reset();
        highlighterDisposer = null;
        _isHighlightBoundToModelContentChanges = false;
      });
      return onDispose;
    };
    this.highLightOnDidChangeModelContent = this.highlightOnDidChangeModelContent;
  }
}

export { COMMENT_ACTION_ID, HIGHLIGHT_MODE, HIGHLIGHT_TYPE, JSXCommentContexts, JSXTypes, MonacoEditorManager, cloneLoc, collectJSXExpressions, configureLoc2Range, configureRange2Loc, MonacoJSXHighlighter as default, extractJSXClosingElement, extractJSXExpressionEdges, extractJSXOpeningElement, getCuratedLoc, getJSXContext, getLoc, isJSXIdentifier, isParentJSXAttribute, makeBabelParse, makeGetAstPromise, makeJSXCommenterBundle, makeParseJSXExpressionsPromise, prepareOptions };
//# sourceMappingURL=monaco-jsx-highlighter.js.map
