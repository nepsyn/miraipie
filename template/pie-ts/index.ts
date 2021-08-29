import {makePie, MiraiPieApplication} from 'miraipie';

module.exports = (ctx: MiraiPieApplication) => {
    ctx.pie(makePie({
        id: '{{id}}',
        name: '{{name}}',
        version: '0.0.1',
        author: '',
        filters: [],
        async received(chat, chain) {
            // do something...
        }
    }));
};
