const { Plugin } = require("powercord/entities");
const { inject, uninject } = require("powercord/injector");
const { getModule } = require("powercord/webpack");

let owoifierToggle = false;

const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
function owoifyText(v) {
    // Code blocks/urls/pings
    if (
        /^`{3}([\S]+)?\n([\s\S]+)\n`{3}/g.test(v) ||
        /<@.?[0-9]*?>/g.test(v) ||
        /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/.test(
            v,
        )
    )
        return v;
    return v
        .replace(/(\w)(\w*)lge/g, "$1$2lgie w$2lgie")
        .replace(/(\w)(\w*)uck/g, "$1$2lgie w$2lgie")
        .replace(/(?:r|l)/g, "w")
        .replace(/(?:R|L)/g, "W")
        .replace(/(n)([aeiou])/gi, "$1y$2")
        .replace(/ove/g, "uv")
        .replace(/th/g, "ff")
        .replace(/!+/g, ` ${faces[Math.floor(Math.random() * faces.length)]} `);
}

module.exports = class Owoify extends Plugin {
    async startPlugin() {
        this.injection();

        powercord.api.commands.registerCommand({
            command: "owoify",
            description: "owoify your message",
            usage: "{c} [ text ]",
            executor: (args) => ({
                send: true,
                result: owoifyText(args.join(" ")),
            }),
        });
        powercord.api.commands.registerCommand({
            command: "owoifyauto",
            description: "owoify all of your messages",
            executor: this.toggleAuto.bind(this),
        });
    }

    async injection() {
        const messageEvents = await getModule(["sendMessage"]);
        inject(
            "owoifierSend",
            messageEvents,
            "sendMessage",
            (args) => {
                let text = args[1].content;
                if (owoifierToggle) {
                    text = owoifyText(text);
                }

                args[1].content = text;
                return args;
            },
            true,
        );
    }

    pluginWillUnload() {
        uninject("owoifierSend");
        powercord.api.commands.unregisterCommand("owoifyauto");
        powercord.api.commands.unregisterCommand("owoify");
    }

    toggleAuto() {
        owoifierToggle = !owoifierToggle;
        powercord.api.notices.sendToast("owoifyNotif", {
            header: "Owoify Auto Status",
            content: `${
                owoifierToggle === true
                    ? "Its weady to go >w<"
                    : "Ok chill we are back to normal again."
            }`,
            buttons: [
                {
                    text: "Dismiss",
                    color: "red",
                    look: "outlined",
                    onClick: () =>
                        powercord.api.notices.closeToast("owoifyNotif"),
                },
            ],
        });
    }
};
