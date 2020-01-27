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
