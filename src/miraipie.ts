import * as Mirai from './mirai';
import * as Pie from './pie';
import * as Tool from './tool';

exports = module.exports = Pie.createMiraiPieApp;
exports.createMiraiPieApp = Pie.createMiraiPieApp;
exports.MiraiPieApp = Pie.MiraiPieApp;
exports.Mirai = Mirai;
exports.Pie = Pie;
exports.Tool = Tool;

export default Pie.createMiraiPieApp;
export {
    Mirai, Pie, Tool
}
