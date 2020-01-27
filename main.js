var support = (function () {
    if (!window.DOMParser) return false;
    var parser = new DOMParser();
    try {
        parser.parseFromString('x', 'text/html');
    } catch (err) {
        return false;
    }
    return true;
})();

var stringToHTML = function (str) {
    if (support) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(str, 'text/html');
        return doc.body;
    }

    var dom = document.createElement('div');
    dom.innerHTML = str;
    return dom
};

var createDOMMap = (element, isSVG) => {
    return Array.prototype.map.call(element.childNodes, ((node) => {
        var details = {
            content: node.childNodes && node.childNodes.length > 0
                ? null
                : node.textContent,
            atts: node.nodeType !== 1
                ? []
                : getAttributes(node.attributes),
            type: node.nodeType === 3
                ? 'text'
                : (node.nodeType === 8
                    ? 'comment'
                    : node.tagName.toLowerCase()),
            node: node
        };

        details.isSVG = isSVG || details.type === 'svg';
        details.children = createDOMMap(node, details.isSVG);
        return details
    }))
}

var getAttributes = (attributes) => {
    return Array.prototype.map.call(attributes, (attribute) => {
        return {
            att: attribute.name,
            value: attribute.value
        };
    })
}

var diff = (templateMap, domMap, elem) => {

    var count = domMap.length - templateMap.length;
    if (count > 0) {
        // remove extra nodes
        for (; count > 0; count--) {
            domMap[domMap.length - count].node.parentNode.removeChild(domMap[domMap.length - count].node);
        }
    }

    // Diff each item
    templateMap.forEach((node, index) => {

    });
}

var createNode = (elem) => {
    let opts = [
        [elem.type === 'text', () => document.createTextNode(elem.content)],
        [elem.type === 'comment', () => document.createComment(elem.content)],
        [elem.isSVG, () => document.createElementNS('http://www.w3.org/2000/svg', elem.type)],
    ]

    opts.reduce((prev, curr) => {
        if (curr[0]) return curr[1];

        return prev;
    }, () => document.createElement(elem.type));

}

var makeElem = (elem) => {
    var node;

    if (elem.type === 'text') {
        node = document.createTextNode(elem.content);
    }
    else if (elem.type === 'comment') {
        node = document.createComment(elem.content);
    } else if (elem.isSVG) {
        node = document.createElementNS('http://www.w3.org/2000/svg', elem.type);
    } else {
        node = document.createElement(elem.type);
    }

    addAttributes(node, elem.atts);

    if (elem.children.length > 0) {
        elem.children.forEach((child => {
            node.appendChild(makeElem(child));
        }));
    } else if (elem.type !== 'text') {
        node.textContent = elem.content;
    }

    return node;
}

var addAttributes = (elem, atts) => {
    atts.forEach((attribute) => {
        elem.setAttribute(attribute.att, attribute.value);
    })
}

var template = `<h1>Hello</h1>
<p>some text</p>
<p>some text</p>
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewbox="0 0 800 800" aria-described="title-thumbsup">
    <title id="title-thumbsup">Thumbs Up!</title>
    <path d="M725 450c57.031 0 25 150-25 150 25 0 0 125-50 125 0 50-50 75-100 75-211.212 0-136.925-52.852-350-75V325C388.22 268.541 575 127.012 575 0c41.406 0 150 50 0 300h150c75 0 50 150 0 150zM150 325v400h50v25H100c-27.5 0-50-33.75-50-75V375c0-41.25 22.5-75 50-75h100v25h-50z"/>
</svg>
`

var app = document.querySelector('#app');

var templateMap = createDOMMap(stringToHTML(template));
var domMap = createDOMMap(app);

diff(templateMap, domMap, app);