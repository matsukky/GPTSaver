import dayjs from "../day.js";
import familyTree from "../familyTree.js";

export default function (file) {
  return new Promise((resolve, reject) => {
    let json = JSON.parse(file)?.props?.pageProps;
    if (!json) reject(new Error("DataFile found, but data not fetch..."));

    const user = {
      name: json.user.name,
      img: json.user.picture,
    };

    const bot = {
      name: "ChatGPT",
      img: "assets/openai.webp",
    };

    const title = json.initialData?.title || "New chat with ChatGPT";
    let msgs = Object.values(json?.initialData?.thread || {});
    if (!msgs || msgs?.length < 1)
      reject(new Error("No messages found. Please Retry."));

    resolve(
      Object({
        parser: { type: "ChatGPT", date: "January 2023" },
        botName: "ChatGPT",
        userName: user.name,
        title,
        color: "#10a37f",
        current: json.currentLeafId,
        messages: familyTree(
          msgs.map((e) =>
            Object({
              visible: e.message.role != "unknown",
              user: Object(e.message.role === "assistant" ? bot : user),
              isBot: e.message.role === "assistant",
              date: dayjs.unix(e.message.create_time),
              content: e.message.content.parts.join("\n"),
              id: e.id,
              parent: e.parentId,
              childs: e.children,
            })
          )
        ),
      })
    );
  });
}
