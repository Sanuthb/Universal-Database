import React from "react";

const Button = ({ text, handleToggle }) => {
  return (
    <button
      onClick={handleToggle}
      className="cursor-pointer text-[var(--primary-color)] bg-[var(--secondary-color)] p-2 rounded text-sm font-medium"
    >
      {text}
    </button>
  );
};

export default Button;
