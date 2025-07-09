import React from "react";

const Badge = ({ connected, children, className = "", ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export default Badge;
