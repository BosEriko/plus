import React from "react";
import { Button as AntButton } from "antd";

const buttonThemes = {
  theme: {
    base: "#f7b43d",
    hover: "#e0a736",
    active: "#c98f2d",
    text: "#fff",
  },
  twitch: {
    base: "#9146FF",
    hover: "#772ce8",
    active: "#5a1bb3",
    text: "#fff",
  },
};

const Button = ({ color, style, ...props }) => {
  if (color && buttonThemes[color]) {
    const { base, hover, active, text } = buttonThemes[color];

    return (
      <AntButton
        {...props}
        style={{
          backgroundColor: base,
          borderColor: base,
          color: text,
          fontWeight: "bold",
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = hover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = base;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.backgroundColor = active;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.backgroundColor = hover;
        }}
      />
    );
  }

  return <AntButton color={color} variant="solid" {...props} style={style} />;
};

export default Button;
