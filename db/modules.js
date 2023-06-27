const {sequelize} = require("./db");
const {STRING, BIGINT, INTEGER, BOOLEAN, TEXT} = require("sequelize");
const {START} = require("../contants/state");
const id = {
    type: BIGINT,
    primaryKey: true,
    autoIncrement: true
}

const User = sequelize.define("user_data", {
    id: {
        type: STRING,
        primaryKey: true,
    },
    state: {
        type: STRING,
        defaultValue: START
    },
    isActive: {
        type: BOOLEAN,
        defaultValue: true
    }
})

const Order = sequelize.define("order_data", {
    id,
    from: {type: STRING},
    to: {type: STRING},
    clientsAmount: {type: INTEGER},
    can_wait: {type: STRING},
    phone_number: {type: STRING},
    creator: {type: STRING},
    msgIdInGroup: {type: STRING},
    isPublished: {type: BOOLEAN, defaultValue: false},
    desc: {type: TEXT},
    isActive: {type: BOOLEAN, defaultValue: true}
})

const MsgToPrivateChat = sequelize.define("msg_to_private_chat", {
    id,
    msgText: {
        type: TEXT,
    },
    resText: {
        type: TEXT
    },
    chatId: {
        type: STRING,
    }
})

module.exports = {User, Order, MsgToPrivateChat}