import React from "react";

export default function Loading() {
  return (
    <div>
      <div className="loader">
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
        <div className="circle">
          <div className="dot" />
          <div className="outline" />
        </div>
      </div>
    </div>
  );
}
