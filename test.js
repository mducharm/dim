var app = {
    root: document.querySelector('#app'),
    render: function () {
        var templateMap = createDOMMap(stringToHTML(this.template(this.data)));
        var domMap = createDOMMap(this.root);
        diff(templateMap, domMap, this.root);
    },
    data: {
        todos: [
            "step 1",
            "step 2",
            "step 3",
        ]
    },
    template: ({todos}) => {
        return `
<h1>Hello!</h1>
<p>test</p>
<p>test</p>
<p>test</p>

<ul>
    ${todos.map(n => `<li class="item">${n}</li>`).reduce((p, c) => p + c)}
</ul>`
    },

}
app.render();
