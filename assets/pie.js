const {Pie, PieFilter} = require('miraipie').Pie;

module.exports = new Pie({
    namespace: '{{namespace}}',
    id: '{{id}}',
    name: '{{name}}',
    author: '',
    version: '1.0.0',
    description: '',
    authorUrl: '',
    projectUrl: '',
    dependencies: [],
    keywords: [],
    filters: [PieFilter.displayStringEquals('Hello')],
    messageHandler: async (window, chain) => {
        await window.send(chain);
    },
    data: {
    },
    exports: {
    },
    methods: {
    }
});
