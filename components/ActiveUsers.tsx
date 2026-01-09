"use client";

import { useEffect, useState } from "react";
import { joinListPresence } from "@/lib/presence";
import { useUser } from "./UserContext";

export default function ActiveUsers({ listId }: any) {
  const { user } = useUser()
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const cleanup = joinListPresence(listId, user, setUsers);

    return cleanup;
  }, [listId, user]);

  return (
    <div className="flex mt-1">
      {users.slice(0, 5).map((u, i) => (
        <div
          key={u.user_id}
          className="
            relative group
            -ml-2 first:ml-0
          "
          style={{ zIndex: i }}
        >
          {/* Avatar */}
          <div
            className="
              h-8 w-8 rounded-full
              flex items-center justify-center
              text-xs font-semibold text-white
              border-2 border-white
            "
            style={{ backgroundColor: u.color }}
          >
            {u.email[0].toUpperCase()}
          </div>

          {/* Tooltip */}
          <div
            className="
              absolute top-full -mt-4 left-1/2 -translate-x-1/2
              whitespace-nowrap
              rounded-md px-2 py-1 text-xs
              opacity-0 group-hover:opacity-100
              transition pointer-events-none
              z-50
              bg-gray-900 text-white
              dark:bg-gray-100 dark:text-gray-900
            "
          >
            {u.email.split('@')[0]}
          </div>
        </div>
      ))}

      {users.length > 5 && (
        <div className="
          h-8 w-8 rounded-full bg-gray-300 text-gray-700
          flex items-center justify-center text-xs font-semibold
          border-2 border-white -ml-2 z-50
        ">
          +{users.length - 5}
        </div>
      )}
    </div>
  );
}