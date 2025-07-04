import React from 'react';

const HomeSideBar = () => {
  return (
    <div className="w-1/6 h-[calc(94vh-11px)] bg-[var(--primary-color)] p-4 border-r-2 border-[var(--border-color)] text-white">
      <h2 className="text-[.7rem] font-semibold mb-4 uppercase text-[var(--secondary-color)]">Account</h2>
      <ul className="space-y-2">
        <li className="bg-[var(--accent-color)] cursor-pointer rounded p-2">Projects</li>
      </ul>
    </div>
  );
};

export default HomeSideBar;
