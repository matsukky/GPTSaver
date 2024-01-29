import dayjs from "../day.js";
import familyTree from "../familyTree.js";

export default function ({conversation, session}) {
  return new Promise((resolve, reject) => {
    let json = conversation
    if (!json) reject(new Error("DataFile found, but data not fetch..."));
    let userData = session || "{}"
    const user = {
      name: userData?.name || "Unknown",
      img: userData?.picture || "assets/icon48.png",
    };

    const bot = {
      name: "ChatGPT",
      img: "assets/openai.webp",
    };
    const title = json?.title || "New chat with ChatGPT";
    let msgs = Object.values(json?.mapping || {});

    if (!msgs || msgs?.length < 1)
      reject(new Error("No messages found. Please Retry."));

  
    resolve(Object({
      parser: { type: "ChatGPT", date: "March 2023" },
      botName: "ChatGPT",
      userName: user.name,
      title,
      color: "#10a37f",
      current: json.current_node,
      messages: familyTree(
        msgs
          .filter((e) => e?.message?.content)
          .map((e) =>
            Object({
              visible: e.message.author.role !== "system",
              user: Object(
                e.message.author.role === "assistant" ? bot : user
              ),
              isBot: e.message.author.role === "assistant",
              date: dayjs.unix(e.message.create_time),
              content: e.message.content.parts.join("\n"),
              id: e.id,
              parent: e.parent,
              childs: e.children,
            })
          )
      ),
    }));
  });
};
