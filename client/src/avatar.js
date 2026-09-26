// Deterministic avatar: same name always produces the same color + initials.
// No external calls, no storage - just math on the name string itself.

const PALETTE = [
  "#E23B4D", "#2FBF87", "#F2A93B", "#E8B93E",
  "#5B8FE8", "#B15BE8", "#E85B9E", "#5BE8D4",
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function getAvatarColor(name) {
  const hash = hashString(name || "?");
  return PALETTE[hash % PALETTE.length];
}

export function getAvatarInitials(name) {
  return getInitials(name || "?");
}
