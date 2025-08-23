import React from "react";

const cardThemes = {
  default: {
    background: "#ffffff",
    border: "#ebe6e7",
    text: "#000000",
  },
  theme: {
    background: "#fef9f3",
    border: "#f7b43d",
    text: "#111",
  },
  twitch: {
    background: "#f5f0ff",
    border: "#9146FF",
    text: "#111",
  },
};

const Card = ({ color = "default", style, children, ...props }) => {
  const theme = cardThemes[color] || cardThemes.theme;

  return (
    <div
      {...props}
      style={{
        backgroundColor: theme.background,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: theme.border,
        color: theme.text,
        borderRadius: "10px",
        padding: "1rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
