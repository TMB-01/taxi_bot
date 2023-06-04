const {Telegraf, Markup} = require('telegraf');
const btn = require("./btn");
const state = require('../contants/state')
const wait = require('../contants/wait')
const {User, Order} = require("../db/modules");
const {updateStateOfId} = require("../service/user");
const {NUMBER_OF_CLIENTS, START} = require("../contants/state");
const {SKIP, POST_TO_GROUP, POST_TO_GROUP_OR_EDIT, EDIT_BUTTONS, FOUND_TAXI, CONFIRM_FOUND} = require("./kbd");
const {
    MAKE_POST, EDIT_POST, EDIT_GO_BACK, EDIT_FROM, EDIT_TO, EDIT_PHONE_NUMBER, EDIT_CAN_WAIT, EDIT_NUMBER_OF_CLIENTS,
    EDIT_DESC, TAXI_FOUND, I_FOUND_TAXI, I_DIDNT_FIND_TAXI
} = require("../contants/callback");
const {skip, go_back_btn} = require("./btn");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN); //@tosh_ang_bot
const groupChatId = "@tosh_ang"

const clientData = (chat) => {
    const {
        id,
        first_name,
        last_name,
        username,
    } = chat;
    if (username) {
        return "@" + username
    } else if (first_name) {
        return `<a href="tg://user?id=${id}">${first_name + (last_name ? " " + last_name : "")}</a>`
    } else {
        return `<a href="tg://user?id=${id}">Post egasi</a>`
    }
}

const phoneNumber = (number) => {
    const pn = number
        .split(" ").join("")
        .split("-").join("")
        .split("(").join("")
        .split(")").join("")
    if (!number.startsWith("+") && pn.length === 12) {
        return "+" + number
    } else {
        return number;
    }
}

const reviewMsg = async (order, isActive) => {
    const chat = await bot.telegram.getChat(order?.creator);
    console.log(chat);
    return (
        (isActive === true ? `#AKTIV\n` : isActive === false ? "#OLINDI\n" : "") +
        `⬇️ ${order?.from}\n` +
        `⏺️️ ${order?.to}\n` +
        `☎️ ${isActive === false ? "+998 ** ***-**-**" : phoneNumber(order?.phone_number)}\n` +
        `⏱️ ${wait[order?.can_wait]}\n` +
        `#️⃣ ${order?.clientsAmount} kishi\n` +
        `👤 ${isActive === false ? "Удаленный аккаунт" : clientData(chat)} \n\n` +
        (order?.desc && order?.desc !== "NO_NEED" ? `🟢 ${order?.desc}\n\n` : "") +
        groupChatId
    )
}

bot.on("message", async (ctx) => {
    const commandNotFound = () => ctx.reply("Buyruq topilmadi");
    const update = ctx.update;
    const message = update.message;
    let text = message?.text;
    let entities = (message?.entities || message?.caption_entities);
    let caption = message?.caption;
    const photo = message?.photo;
    const video = message?.video;
    const location = message?.location;
    const contact = message?.contact;
    const forward_from_chat = message?.forward_from_chat
    const chat = ctx.chat;
    const chatId = String(chat.id);
    const updateState = updateStateOfId(chatId, ctx);
    const [user] = await User.findOrCreate({where: {id: chatId}});
    const userState = user?.state;
    if (text && chat.type === "private") {
        if (text.startsWith("/start")) {
            await ctx.reply("Botga xush kelibsiz");
            await updateState(state.START);
        } else if (user.state === state.START) {
            if (text === btn.create_order) {
                await updateState(state.FROM);
            } else {
                commandNotFound();
                await updateState(state.START);
            }
        } else if (user.state.startsWith(state.FROM)) {
            const order = await Order.create({from: text, creator: chatId});
            await updateState(`${state.TO}|${order.id}`);
        } else if (user.state.startsWith(state.TO)) {
            const orderId = user.state.split("|")[1];
            await Order.update({to: text}, {where: {id: orderId}});
            await updateState(`${NUMBER_OF_CLIENTS}|${orderId}`);
        } else if (user.state.startsWith(state.NUMBER_OF_CLIENTS)) {
            const orderId = user.state.split("|")[1];
            if (["1", "2", "3", "4"].includes(text)) {
                await Order.update({clientsAmount: Number(text)}, {where: {id: orderId}})
                await updateState(`${state.PHONE_NUMBER}|${orderId}`);
            } else {
                await updateState(`${NUMBER_OF_CLIENTS}|${orderId}`);
                commandNotFound();
            }
        } else if (user.state.startsWith(state.PHONE_NUMBER)) {
            const orderId = user.state.split("|")[1];
            const regExp = /^(([+]?998)?[( ]?[0-9]{2}[) ]?[ ]?[0-9]{3}[- ]?[0-9]{2}[- ]?[0-9]{2})$/
            if (regExp.test(text.trim())) {
                await Order.update({phone_number: text.trim()}, {where: {id: orderId}})
                await updateState(`${state.CAN_WAIT}|${orderId}`);
            } else {
                ctx.reply("Telefon raqamni xato farmatda yozdiz, yana urinib kuring");
            }
        } else if (user.state.startsWith(state.CAN_WAIT)) {
            const orderId = user.state.split("|")[1];
            const isValidWait = Object.entries(wait).find(([key, value]) => value === text);
            if (isValidWait?.length) {
                await Order.update({can_wait: isValidWait[0]}, {where: {id: orderId}});
                await updateState(`${state.DESC}|${orderId}`);
            } else {
                ctx.reply("Iltimos tugmalarni birini bosing")
            }
        } else if (user.state.startsWith(state.DESC)) {
            const orderId = user.state.split("|")[1];
            if (text === skip || text === "NO_NEED") {
                await Order.update({desc: "NO_NEED"}, {where: {id: orderId}})
            } else {
                await Order.update({desc: text}, {where: {id: orderId}})
            }
            const order = await Order.findByPk(orderId);
            await updateState(`${state.REVIEW}|${orderId}`);
            ctx.replyWithHTML(
                await reviewMsg(order),
                POST_TO_GROUP_OR_EDIT(orderId)
            )
        } else if (user.state.startsWith(state.REVIEW)) {
            commandNotFound();
            await updateState(state.START);
            // const orderId = user.state.split("|")[1];
            // const order = await Order.findByPk(orderId);
            // await updateState(`${state.REVIEW}|${orderId}`);
            // await ctx.replyWithHTML(
            //     await reviewMsg(order),
            //     POST_TO_GROUP_OR_EDIT(orderId)
            // )
            // ctx.editMessageText(reviewMsg(order),
            //     CREATOR_AND_POST(chatId, orderId))
            // ctx.reply(
            //     reviewMsg(order),
            //     CREATOR_AND_POST(chatId, orderId)
            // )
        } else if (userState.startsWith(state.EDIT_FROM)) {
            const orderId = user.state.split("|")[1];
            await updateState(`${state.REVIEW}|${orderId}`);
            if (text !== go_back_btn) {
                ctx.replyWithHTML("O'zgartirildi")
                await Order.update({from: text}, {where: {id: orderId}});
            }
            const order = await Order.findByPk(orderId);
            let rmText = await reviewMsg(order);
            rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
            ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
        } else if (userState.startsWith(state.EDIT_TO)) {
            const orderId = user.state.split("|")[1];
            if (text !== go_back_btn) {
                ctx.replyWithHTML("O'zgartirildi")
                await Order.update({to: text}, {where: {id: orderId}});
            }
            await updateState(`${state.REVIEW}|${orderId}`);
            const order = await Order.findByPk(orderId);
            let rmText = await reviewMsg(order);
            rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
            ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
        } else if (userState.startsWith(state.EDIT_PHONE_NUMBER)) {
            const orderId = user.state.split("|")[1];
            if (text === go_back_btn) {
                await updateState(`${state.REVIEW}|${orderId}`);
                const order = await Order.findByPk(orderId);
                let rmText = await reviewMsg(order);
                rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
                ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
            } else {
                const regExp = /^(([+]?998)?[( ]?[0-9]{2}[) ]?[ ]?[0-9]{3}[- ]?[0-9]{2}[- ]?[0-9]{2})$/
                if (regExp.test(text.trim())) {
                    await Order.update({phone_number: text.trim()}, {where: {id: orderId}})
                    ctx.replyWithHTML("O'zgartirildi")
                    await updateState(`${state.REVIEW}|${orderId}`);
                    const order = await Order.findByPk(orderId);
                    let rmText = await reviewMsg(order);
                    rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
                    ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
                } else {
                    ctx.reply("Telefon raqamni xato farmatda yozdiz, yana urinib kuring");
                }
            }
        } else if (userState.startsWith(state.EDIT_CAN_WAIT)) {
            const orderId = user.state.split("|")[1];
            if (text === go_back_btn) {
                await updateState(`${state.REVIEW}|${orderId}`);
                const order = await Order.findByPk(orderId);
                let rmText = await reviewMsg(order);
                rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
                ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
            } else {
                const isValidWait = Object.entries(wait).find(([key, value]) => value === text);
                if (isValidWait?.length) {
                    await Order.update({can_wait: isValidWait[0]}, {where: {id: orderId}});
                    ctx.replyWithHTML("O'zgartirildi")
                    await updateState(`${state.REVIEW}|${orderId}`);
                    const order = await Order.findByPk(orderId);
                    let rmText = await reviewMsg(order);
                    rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
                    ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
                } else {
                    ctx.reply("Iltimos tugmalarni birini bosing")
                }
            }
        } else if (userState.startsWith(state.EDIT_NUMBER_OF_CLIENTS)) {
            const orderId = user.state.split("|")[1];
            if (text === go_back_btn) {
                await updateState(`${state.REVIEW}|${orderId}`);
                const order = await Order.findByPk(orderId);
                let rmText = await reviewMsg(order);
                rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
                ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
            } else {
                if (["1", "2", "3", "4"].includes(text)) {
                    await Order.update({clientsAmount: Number(text)}, {where: {id: orderId}})
                    ctx.replyWithHTML("O'zgartirildi")
                    await updateState(`${state.REVIEW}|${orderId}`);
                    const order = await Order.findByPk(orderId);
                    let rmText = await reviewMsg(order);
                    rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
                    ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
                } else {
                    await updateState(`${state.EDIT_NUMBER_OF_CLIENTS}|${orderId}`);
                    commandNotFound();
                }
            }
        } else if (userState.startsWith(state.EDIT_DESC)) {
            const orderId = user.state.split("|")[1];
            if (text !== go_back_btn) {
                ctx.replyWithHTML("O'zgartirildi")
                await Order.update({desc: text}, {where: {id: orderId}});
            }
            await updateState(`${state.REVIEW}|${orderId}`);
            const order = await Order.findByPk(orderId);
            let rmText = await reviewMsg(order);
            rmText += "\n\n<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
            ctx.replyWithHTML(rmText, EDIT_BUTTONS(orderId))
        }
    }
}, "message")

bot.on("callback_query", async (ctx) => {
    const update = ctx?.update;
    const callback_query = update?.callback_query
    const message = callback_query?.message;
    const chat = message?.chat;
    const callback_query_data = callback_query?.data
    const from = callback_query?.from

    const updateState = updateStateOfId(from?.id, ctx);

    if (chat?.type === "private") {
        if (callback_query_data?.startsWith(`${MAKE_POST}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);
            if (!order.msgIdInGroup) {
                const sM = await ctx.telegram.sendMessage(groupChatId,
                    await reviewMsg(order, order?.isActive),
                    {
                        parse_mode: "HTML"
                    }
                )
                await ctx.editMessageText(
                    await reviewMsg(order)
                    + `\n\n<a href="https://t.me/${sM?.chat?.username}/${sM?.message_id}">E'lon guruhga joylandi</a> \n<i>Taksi topganizdan keyin quyidagi tugmani bossayiz guruhdan telefon raqamiz va lichkangizni uchirib quyamiz boshqalar telefon qilib yoki yozib sizni bezovta qimasligi uchun. </i>\n<b>Raxmat</b>`,
                    {
                        ...FOUND_TAXI(orderId),
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    }
                )
                await Order.update({msgIdInGroup: sM?.message_id, isPublished: true}, {where: {id: orderId}});
                // await ctx.replyWithHTML(
                //     `<a href="https://t.me/${sM?.chat?.username}/${sM?.message_id}">Post guruhga joylandi</a>`,
                //     {disable_web_page_preview: true}
                // )
            } else {
                await ctx.editMessageText(
                    await reviewMsg(order),
                    {
                        parse_mode: "HTML"
                    }
                )
                await ctx.replyWithHTML(
                    `<a href="https://t.me/${groupChatId?.slice(1)}/${order?.msgIdInGroup}">Siz bu postni guruhga joylagansiz</a>`,
                    {disable_web_page_preview: true}
                )
            }
            await updateState(state?.START)
        } else if (callback_query_data?.startsWith(`${EDIT_POST}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);
            let text = await reviewMsg(order);
            text = text + "\n\n" + "<u>O'zgartirmoqchi bugan narsayizni quyidagi tugmalardan tanlang</u>"
            ctx.editMessageText(text, {...EDIT_BUTTONS(orderId), parse_mode: "HTML"})
        } else if (callback_query_data?.startsWith(`${EDIT_GO_BACK}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);
            ctx.editMessageText(await reviewMsg(order), POST_TO_GROUP_OR_EDIT(orderId))
        } else if (callback_query_data?.startsWith(`${EDIT_FROM}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);
            ctx.editMessageText(await reviewMsg(order));
            await updateState(`${state?.EDIT_FROM}|${orderId}`);
        } else if (callback_query_data?.startsWith(`${EDIT_TO}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            ctx.editMessageText(await reviewMsg(order));
            await updateState(`${state?.EDIT_TO}|${orderId}`);
        } else if (callback_query_data?.startsWith(`${EDIT_PHONE_NUMBER}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            ctx.editMessageText(await reviewMsg(order));
            await updateState(`${state?.EDIT_PHONE_NUMBER}|${orderId}`);
        } else if (callback_query_data?.startsWith(`${EDIT_CAN_WAIT}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            ctx.editMessageText(await reviewMsg(order));
            await updateState(`${state?.EDIT_CAN_WAIT}|${orderId}`);
        } else if (callback_query_data?.startsWith(`${EDIT_NUMBER_OF_CLIENTS}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            ctx.editMessageText(await reviewMsg(order));
            await updateState(`${state?.EDIT_NUMBER_OF_CLIENTS}|${orderId}`);
        } else if (callback_query_data?.startsWith(`${EDIT_DESC}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            ctx.editMessageText(await reviewMsg(order));
            await updateState(`${state?.EDIT_DESC}|${orderId}`);
        } else if (callback_query_data?.startsWith(`${TAXI_FOUND}`)) {
            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            let rText = await reviewMsg(order);
            rText += "\n\n<i>Quyidagi <b>Tasdiqliman</b> tugmansini bossayiz sizni e'lonizdan telefon raqamiz va lichkangizga bugan linkni olib tashlaymiz boshqalar bezovta qimasligi uchun. E'lonizni statusini olindi qilib quyamiz.</i>"
            ctx.editMessageText(rText, {...CONFIRM_FOUND(orderId), parse_mode: "HTML"})
        } else if (callback_query_data?.startsWith(`${I_FOUND_TAXI}`)) {
            const orderId = callback_query_data?.split("|")[1];
            await Order.update({isActive: false}, {where: {id: orderId}})
            const order = await Order.findByPk(orderId);
            await ctx.telegram.editMessageText(groupChatId, order?.msgIdInGroup, undefined, await reviewMsg(order, order?.isActive, {parse_mode: "HTML"}));
            let rText = await reviewMsg(order);
            rText += `\n\n<i>Taksi topganizni tasdiqlaganiz uchun raxmat. <a href="https://t.me/${groupChatId}/${order?.msgIdInGroup}">E'lonizdagi malumotlarizni uchirib quydik</a>. Yordamimiz tekganbusa xursandmiz. \nKuniz xayirli utsin</i>`
            ctx.editMessageText(rText, {parse_mode: "HTML"})
            // await updateState(state.START);
        } else if (callback_query_data?.startsWith(`${I_DIDNT_FIND_TAXI}`)) {

            const orderId = callback_query_data?.split("|")[1];
            const order = await Order.findByPk(orderId);

            await ctx.editMessageText(
                await reviewMsg(order)
                + `\n\n<a href="https://t.me/${groupChatId}/${order?.msgIdInGroup}">E'loniz guruhga joylangan</a> \n<i>Taksi topganizdan keyin quyidagi tugmani bossayiz guruhdan telefon raqamiz va lichkangizni uchirib quyamiz boshqalar telefon qilib yoki yozib sizni bezovta qimasligi uchun. </i>\n<b>Raxmat</b>`,
                {
                    ...FOUND_TAXI(orderId),
                    parse_mode: "HTML",
                    disable_web_page_preview: true
                }
            )
        }
    }
})

bot.catch((err) => {
    console.log(err);
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const launchBot = () => {
    return bot.launch();
}

module.exports = {launchBot}