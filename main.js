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



var addAttributes = (elem, atts) => {
    atts.forEach((attribute) => {
        elem.setAttribute(attribute.att, attribute.value);
    })
}
