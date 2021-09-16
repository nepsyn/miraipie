module.exports = class extends WebSocket {
    on(event, listener) {
        if (event === 'message') {
            this.addEventListener('message', (event) => {
                listener(event.data);
            });
        } else {
            this.addEventListener(event, listener);
        }
    }
};
