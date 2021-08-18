import {makePie, MiraiPieApplication} from 'miraipie';

module.exports = (ctx: MiraiPieApplication) => {
    ctx.pie(makePie({
        id: 'my-pie',
        name: 'my pie',
        version: '0.0.1',
        author: '',
        filters: [],
        async received(window, chain) {
            // do something...
        }
    }));
};
