const {makePie, PieFilter} = require('miraipie');

module.exports = (ctx) => {
    ctx.pie(makePie({
        id: 'repeater',
        name: '复读机',
        version: '1.0.0',
        author: 'Nepsyn',
        filters: [PieFilter.fromFriend],
        async received(window, chain) {
            await window.send(chain);
        }
    }));
};
