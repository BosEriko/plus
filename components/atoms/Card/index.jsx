import React from "react";

const cardThemes = {
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

const Card = ({ color = "theme", style, children, ...props }) => {
  const theme = cardThemes[color] || cardThemes.theme;

  return (
    <div
      {...props}
      style={{
        backgroundColor: theme.background,
        border: `2px solid ${theme.border}`,
        color: theme.text,
        borderRadius: "1rem", // rounded corners
        padding: "1rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        transition: "all 0.2s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </div>
  );
};

export default Card;
