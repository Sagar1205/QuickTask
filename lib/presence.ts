// lib/presence.ts
import { dedupeUsers, stringToColor } from "./helper";
import { supabase } from "./supabase";

export function joinListPresence(listId: string, user: any, onChange: (users: any[]) => void) {
  const channel = supabase.channel(`presence:list:${listId}`, {
    config: {
      presence: { key: user.id },
    },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users = Object.values(state).flat();
      const uniqueUsers = dedupeUsers(users,user.id);
      onChange(uniqueUsers);
    });

  channel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await channel.track({
        user_id: user.id,
        email: user.email,
        name: user.email.split("@")[0],
        color: stringToColor(user.email),
      });
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}