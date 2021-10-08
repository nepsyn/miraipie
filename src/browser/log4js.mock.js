let globalLogger = console;
module.exports = {
    setLogger: (logger) => {
        globalLogger = logger;
    },
    configure: () => undefined,
    getLogger: () => globalLogger
};
