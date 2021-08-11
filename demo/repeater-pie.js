const MiraiPie = require('miraipie');
const {Pie, PieFilter} = MiraiPie.Pie;

module.exports = new Pie({
    namespace: 'miraipie',
    id: 'repeater',
    name: '复读机',
    version: '1.0.0',
    author: 'Nepsyn',
    filters: [PieFilter.fromFriend],
    async messageHandler(window, chain) {
        await window.send(chain);
    }
});
