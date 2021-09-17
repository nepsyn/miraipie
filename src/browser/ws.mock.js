module.exports = class extends WebSocket {
    on(event, listener) {
        if (event === 'message') {
            this.addEventListener('message', (event) => {
                listener(event.data);
            });
        } else if (event === 'error') {
            this.addEventListener('error', (event) => {
                listener({message: event});
            });
        }
    }
};
