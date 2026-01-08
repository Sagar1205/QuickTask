export function dedupeUsers(users: any[], userId: string) {
  const map = new Map();
  for (const u of users) {
    if (u.user_id === userId) continue; 
    map.set(u.user_id, u);
  }
  return Array.from(map.values());
}

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 50%)`;
}