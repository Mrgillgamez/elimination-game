import { getAvatarColor, getAvatarInitials } from "../avatar";
import "./Avatar.css";

function Avatar({ name, size = "medium" }) {
  const color = getAvatarColor(name);
  const initials = getAvatarInitials(name);

  return (
    <div className={`avatar avatar-${size}`} style={{ backgroundColor: color }}>
      {initials}
    </div>
  );
}

export default Avatar;
