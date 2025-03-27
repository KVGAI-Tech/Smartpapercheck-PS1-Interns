import React from "react";
import { Circles } from "react-loader-spinner";

const LoadingIndicator = () => {
  return (
    <div className="loader">
      <Circles color="#dc1c2c" height={50} width={100} />
    </div>
  );
};

export default LoadingIndicator;
