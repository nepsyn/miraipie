const {makePie} = require('miraipie');

module.exports = (ctx) => {
    ctx.pie(makePie({
        id: 'my-pie',
        name: 'my pie',
        version: '0.0.1',
        author: '',
        filters: [],
        async received(chat, chain) {
            // do something...
        }
    }));
};
