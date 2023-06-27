const {Api, TelegramClient} = require("telegram");
const {StringSession} = require("telegram/sessions");
const input = require("input");
const {MsgToPrivateChat} = require("../db/modules"); // npm i input

const apiId = 29151508;
const apiHash = "f29be0394a1f9892000bf22bde7cb892";

const stringSession = new StringSession("1AgAOMTQ5LjE1NC4xNjcuNTABu5J17AYvlCSKfnioCniELlRJG6WAztoiAxNorah2FIHCrmox73SZZfVQGfn4TyVHU8IDmu6i06Q9wHeelzHQdOTYa+i+hkjJGYc+8llqPXAYU+ZfwFmkX1srwF1gE5iEIUUMdgTgpInIlEgryv4yuK/CpsFF2V/HQJhrTp9u9I4hjmx1JOp3P2qEdlaYlv7mPU5JmjDnfgPKcJbQvzfYPDmotTp2al5I352bTJv32kIwiNC0Iy0lTmYL8rDov5d3Q345VfsN9ktLMYIRQ0Ah6wRaQvwTt3AEsh6Y2tMHCtBTkQVNW16MJCL+gS/7/46pFO8dVXLfh8UDB9uwy57xcEc="); // fill this later with the value from session.save()

(async () => {
    console.log("Loading interactive example...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await input.text("number ?"),
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log(client.session.save()); // Save this string to avoid logging in again
    // const chats = [
    //     286602133, 1272535246,
    //     5396416357,
    // ]
    // for (let i = 0; i < chats?.length; i++) {
    //     const id = chats[i];
    // await client.sendMessage(id, {message: textToTaxiDriver});
    // }
    // const textToTaxiDriver = "Assalomu alaykum\n\n" +
    //     "Men dasturchiman. Sizning kontaktingizni @TOSHKENT_ANGREN_TAKSI guruhidan oldim.\n\n" +
    //     "Yuqoridagi guruhda siz admin ekansiz demak Toshkent - Angren taksist bo‘lib ishlaysiz.\n\n" +
    //     "<u>Sizni @tosh_ang guruhiga taklif qilaman.</u>\n\n" +
    //     "Guruhni taksi xizmatini yaxshilash maqsadida yaratdim. Bu juda qulay. Mijoz bot orqali qayerdan qayerga borishi, nechi kishiligi va boshqa ma’lumotlarni yozadi. Bot esa ma’lumotlarni olib guruhga tashlab quyadi. Keyin haydovchilar shu mijoz bilan bog‘lanishi mumkin. Mijoz botda \"taksi topdim\" degan tugmani bosganidan keyin guruhdagi e’lon #OLINDI deb yozib quyadi. Hammasi avtomatlashtirilgan.\n\n" +
    //     "<i>Juda oson, shunaqa emasmi?</i>\n\n" +
    //     "<b>Botga kirib tekshirib ko‘rishingiz mumkin @tosh_ang_bot</b>\n\n" +
    //     "Mijozlarga qulaylik yaratish maqsadida guruhda haydovchilar kontaktlarini qoldirmoqchiman, sizningam ma’lumotlaringizni joylashtirish uchun quyidagi link orqali kirib ma’lumotlaringizni to‘ldirishingizni so‘rayman.\n\n" +
    //     "https://forms.gle/yQzcvGgA4ohcjBQ27\n\n" +
    //     "Hozirgi reja guruhga <b>haydovchilarni yig‘ish</b>, keyin esa <b>mijozlarni</b>. Shuning uchun guruhga tezroq qo‘shilib oling. \n\n" +
    //     "Boshqa haydovchilar bilan ham bu xabarni bo‘lishsangiz xursand bulardim.\n<i>Rahmat. Oq yo‘l</i>";

    const result = await client.invoke(
        new Api.channels.GetParticipants({
            channel: "TOSHKENT_ANGREN_TAKSI",
            // filter: new Api.ChannelParticipantsRecent({}),
            filter: new Api.ChannelParticipantsAdmins({}),
            offset: 0,
            limit: 200,
            hash: BigInt("-4156887774564"),
        })
    );
    console.log(result, result?.count, result?.count / 200)
    for (let i = 0; i < Math.ceil(result?.count / 200); i++) {
        const result = await client.invoke(
            new Api.channels.GetParticipants({
                channel: "TOSHKENT_ANGREN_TAKSI",
                // filter: new Api.ChannelParticipantsRecent({}),
                filter: new Api.ChannelParticipantsAdmins({}),
                offset: i * 200,
                limit: 200,
                hash: BigInt("-4156887774564"),
            })
        );
        const list = result
            ?.participants
            .map(({userId: id}) => id?.valueOf());
        console.log(list)
        for (let j = 0; j < list.length; j++) {
            const chatId = list[j];
            console.log(chatId)
            try {
                const res = await client.sendMessage(chatId, {
                    message: textToTaxiDriver,
                    linkPreview: false,
                    parseMode: "html"
                })
                // console.log(res);
                await MsgToPrivateChat.create({
                    msgText: textToTaxiDriver,
                    resText: JSON.stringify(res),
                    chatId
                })
                await new Promise((resolve, reject) => {
                    setTimeout(() => resolve(), 500)
                })
            } catch (err) {
                console.log(err);
            }


        }
        // console.log(list.join(","))
        // console.log(i, list?.length)
    }
})();