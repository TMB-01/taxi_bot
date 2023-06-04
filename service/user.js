const {User} = require("../db/modules");
const {
    START,
    FROM,
    TO,
    NUMBER_OF_CLIENTS,
    PHONE_NUMBER,
    CAN_WAIT,
    REVIEW,
    DESC,
    EDIT_FROM, EDIT_TO, EDIT_NUMBER_OF_CLIENTS, EDIT_PHONE_NUMBER, EDIT_CAN_WAIT, EDIT_DESC
} = require("../contants/state");
const kbd = require("../tg/kbd");
const {Markup} = require("telegraf");
const {GO_BACK} = require("../tg/kbd");
const updateStateOfId = (chatId, ctx) => async (state) => {
    await User.update({state}, {where: {id: chatId}});
    if (state.startsWith(START)) {
        return await ctx.reply("Quyidagi tugmani bosib taksi buyurtma berishiz mumkin", kbd.START_MENU);
    } else if (state.startsWith(FROM)) {
        return await ctx.reply("Sizni qayerdan olish kerak", Markup.removeKeyboard());
    } else if (state.startsWith(`${TO}|`)) {
        return await ctx.reply("Qayerga bormoqchisiz?", Markup.removeKeyboard());
    } else if (state.startsWith(NUMBER_OF_CLIENTS)) {
        return await ctx.reply("Nechikishisizlar?", kbd.NUMBER_OF_PASSENGERS)
    } else if (state.startsWith(PHONE_NUMBER)) {
        return await ctx.reply("Telefon raqamingizni kiriting", Markup.removeKeyboard());
    } else if (state.startsWith(CAN_WAIT)) {
        return await ctx.reply("Qancha kutaolasiz?", kbd.CAN_WAIT);
    } else if (state.startsWith(DESC)) {
        return await ctx.reply("Taksiga qanaqadir xabariz bulsa yozishiz mumkin bumasa quyidagi tugmani bosing", kbd.SKIP);
    } else if (state.startsWith(REVIEW)) {
        const rK = await ctx.reply(".", Markup.removeKeyboard());
        return await ctx.telegram.deleteMessage(chatId, rK?.message_id)
    } else if (state.startsWith(EDIT_FROM)) {
        return await ctx.reply("Sizni qayerdan olish kerak", GO_BACK)
    } else if (state.startsWith(EDIT_TO)) {
        return await ctx.reply("Qayerga bormoqchisiz?", GO_BACK)
    } else if (state.startsWith(EDIT_NUMBER_OF_CLIENTS)) {
        return await ctx.reply("Nechikishisizlar?", kbd.EDIT_NUMBER_OF_PASSENGERS)
    } else if (state.startsWith(EDIT_PHONE_NUMBER)) {
        return await ctx.reply("Telefon raqamingizni kiriting", GO_BACK)
    } else if (state.startsWith(EDIT_CAN_WAIT)) {
        return await ctx.reply("Qancha kutaolasiz?", kbd.EDIT_CAN_WAIT)
    } else if (state.startsWith(EDIT_DESC)) {
        return await ctx.reply("Taksiga qanaqadir xabariz bor", GO_BACK)
    } else {
        return true;
    }
}

module.exports = {updateStateOfId}