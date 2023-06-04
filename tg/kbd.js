const {Markup} = require("telegraf");
const {create_order, skip, go_back_btn} = require("./btn");
const {HALF_AN_NOUR, AN_HOUR, TWO_HOURS, THREE_HOURS, DONT_CARE} = require("../contants/wait");
const {
    MAKE_POST, EDIT_POST, EDIT_FROM, EDIT_TO, EDIT_CAN_WAIT, EDIT_NUMBER_OF_CLIENTS, EDIT_PHONE_NUMBER, EDIT_DESC,
    EDIT_GO_BACK, TAXI_FOUND, I_FOUND_TAXI, I_DIDNT_FIND_TAXI
} = require("../contants/callback");
module.exports = {
    START_MENU: Markup.keyboard([
        [Markup.button.text(create_order)],
    ]).resize(),
    NUMBER_OF_PASSENGERS: Markup.keyboard([
        [Markup.button.text("1"), Markup.button.text("2")],
        [Markup.button.text("3"), Markup.button.text("4")]
    ]).resize(),
    CAN_WAIT: Markup.keyboard([
        [Markup.button.text(HALF_AN_NOUR)],
        [Markup.button.text(AN_HOUR)],
        [Markup.button.text(TWO_HOURS)],
        [Markup.button.text(THREE_HOURS)],
        [Markup.button.text(DONT_CARE)],
    ]).resize(),
    SKIP: Markup.keyboard([
        [Markup.button.text(skip)]
    ]).resize(),
    GO_BACK: Markup.keyboard([
        [Markup.button.text(go_back_btn)]
    ]).resize(),
    // CREATOR: (chatId) => Markup.inlineKeyboard([Markup.button.url("Post egasi", `tg://user?id=${chatId}`)]),
    // CREATOR_AND_POST: (chatId, order_id) => Markup.inlineKeyboard([
    //     [Markup.button.url("Post egasi", `tg://user?id=${chatId}`)],
    //     [Markup.button.callback("Postni guruhga joylash", `${MAKE_POST}_${order_id}`)],
    // ])
    POST_TO_GROUP_OR_EDIT: (order_id) => Markup.inlineKeyboard([
        [Markup.button.callback("Tahrirlash", `${EDIT_POST}|${order_id}`)],
        [Markup.button.callback("Guruhga joylash", `${MAKE_POST}|${order_id}`)],
    ]),
    EDIT_BUTTONS: (order_id) => (
        Markup.inlineKeyboard([
            [
                Markup.button.callback("⬇️", `${EDIT_FROM}|${order_id}`),
                Markup.button.callback("⏺️️", `${EDIT_TO}|${order_id}`)
            ],
            [
                Markup.button.callback("☎️", `${EDIT_PHONE_NUMBER}|${order_id}`),
                Markup.button.callback("⏱️", `${EDIT_CAN_WAIT}|${order_id}`)
            ],
            [
                Markup.button.callback("#️⃣", `${EDIT_NUMBER_OF_CLIENTS}|${order_id}`),
                Markup.button.callback("🟢", `${EDIT_DESC}|${order_id}`)
            ],
            [Markup.button.callback("🔙 Orqaga qaytish", `${EDIT_GO_BACK}|${order_id}`)],
        ])),
    EDIT_NUMBER_OF_PASSENGERS: Markup.keyboard([
        [Markup.button.text("1"), Markup.button.text("2")],
        [Markup.button.text("3"), Markup.button.text("4")],
        [Markup.button.text(go_back_btn)]
    ]).resize(),
    EDIT_CAN_WAIT: Markup.keyboard([
        [Markup.button.text(HALF_AN_NOUR)],
        [Markup.button.text(AN_HOUR)],
        [Markup.button.text(TWO_HOURS)],
        [Markup.button.text(THREE_HOURS)],
        [Markup.button.text(DONT_CARE)],
        [Markup.button.text(go_back_btn)]
    ]).resize(),
    FOUND_TAXI: (orderId) => Markup.inlineKeyboard([
        [Markup.button.callback("Taksi topildi", `${TAXI_FOUND}|${orderId}`)]
    ]),
    CONFIRM_FOUND: (orderId) => (
        Markup.inlineKeyboard(
            [
                [Markup.button.callback("Tasdiqliman", `${I_FOUND_TAXI}|${orderId}`)],
                [Markup.button.callback("Orqaga qaytish", `${I_DIDNT_FIND_TAXI}|${orderId}`)],
            ]
        )
    )
}