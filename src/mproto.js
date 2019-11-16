const mtproto = require ('./telegram-mtproto').MTProto;

const init = (apiId, name, storage) => {

    const api = {
        invokeWithLayer: 0xda9b0d0d,
        layer: 57,
        initConnection: 0x69796de9,
        api_id: apiId,
        app_version: '1.0.1',
        lang_code: 'en',
    };
    
    const server = {
        webogram: false,
        dev: false,
    };

    const app = {
        storage: storage
    };

    return mtproto ({
        api,
        server,
        app
    });
};

module.exports = init;
