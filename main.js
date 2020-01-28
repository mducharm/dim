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

        // Create if element doesn't exist
        if (!domMap[index]) {
            elem.appendChild(makeElem(templateMap[index]));
            return;
        }

        // Replace with new element if not same type
        if (templateMap[index].type !== domMap[index].type) {
            domMap[index].node.parentNode.replaceChild(makeElem(templateMap[index]), domMap[index].node);
            return;
        }

        diffAtts(templateMap[index], domMap[index]);

        // Update if content is different
        if (templateMap[index].content !== domMap[index].content) {
            domMap[index].node.textContent = templateMap[index].content;
            return;
        }

        // Clear if element should be empty
        if (domMap[index].children.length > 0 && node.children.length < 1) {
            domMap[index].node.innerHTML = '';
            return;
        }

        // If element is empty and shouldn't be
        if (domMap[index].children.length < 1 && node.children.length > 0) {
            var fragment = document.createDocumentFragment();
            diff(node.children, domMap[index].children, fragment);
            elem.appendChild(fragment);
            return;
        }

        if (node.children.length > 0) {
            diff(node.children, domMap[index].children, domMap[index].node);
        }

    });
}

var diffAtts = (template, existing) => {

    // get attributes to remove
    var remove = existing.atts.filter((att) => {
        var getAtt = template.atts.find((newAtt) => att.att === newAtt.att);
        return getAtt === undefined;
    });

    // get attributes to change
    var change = template.atts.filter((att) => {
        var getAtt = find(existing.atts, (existingAtt) => att.att === existingAtt.att);
        return getAtt === undefined || getAtt.value !== att.value;
    });

    addAttributes(existing.node, change);
    removeAttributes(existing.node, remove);
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
        if (attribute.att === 'class') {
            elem.className = attribute.value;
        } else if (attribute.att === 'style') {
            diffStyles(elem, attribute.value);
            // var styles = getStyleMap(attribute.value);
            // styles.forEach((style) => {
            //     elem.style[style.name] = style.value;
            // })
        } else {
            elem.setAttribute(attribute.att, attribute.value || true);
        }
    })
}

var removeAttributes = (elem, atts) => {
    atts.forEach(attribute => {
        if (attribute.att === 'class') {
            elem.className = '';
        } else if (attribute.att === 'style') {
            removeStyles(elem, Array.prototype.slice.call(elem.style))
        } else {
            elem.removeAttribute(attribute.att);
        }
    })
}

var diffStyles = (elem, styles) => {
    var styleMap = getStyleMap(styles);
    var remove = Array.prototype.filter.call(elem.style, (style) => {
        var findStyle = styleMap.find((newStyle) =>
            newStyle.name === style && newStyle.value === elem.style[style]);

        return findStyle === undefined;
    });

    removeStyles(elem, remove);
    changeStyles(elem, styleMap);
};

var removeStyles = (elem, styles) => {
    styles.forEach((style) => {
        elem.style[style] = ''
    });
}

var changeStyles = (elem, styles) => {
    styles.forEach((style) => {
        elem.style[style.name] = style.value;
    });
}

var getStyleMap = (styles) => {
    return styles.split(';').reduce((arr, style) => {
        if (style.trim().indexOf(':') > 0) {
            var styleArr = style.split(':');
            arr.push({
                name: styleArr[0] ? styleArr[0].trim() : '',
                value: styleArr[1] ? styleArr[1].trim() : '',
            })
            return arr;
        }
    }, [])
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