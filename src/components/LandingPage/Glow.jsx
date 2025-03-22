import React from "react";

const Glow = () => {
  return (
    <div className="my-5">
      <div className="h-[10rem] relative overflow-hidden">
        <div className="oval__small" />
      </div>
      <div className="line-white z-10 absolute" />
      <div className="h-[10rem] relative overflow-hidden">
        <div className="oval__large" />
      </div>
    </div>
  );
};

export default Glow;