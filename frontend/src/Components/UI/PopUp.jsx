import React from 'react';

const PopUp = ({handleToggle}) => {
  return (
    <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.6)] flex items-center justify-center z-50'>
      <div className="bg-[var(--primary-color)] text-white p-6 rounded shadow-md w-[90%] max-w-md border border-[var(--border-color)]">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <input 
          type="text" 
          placeholder="Project Name" 
          className="w-full p-2 mb-4 rounded bg-[var(--accent-color)] text-white border border-[var(--border-color)] outline-none"
        />
        <div className="flex justify-end gap-2">
          <button className="cursor-pointer bg-[var(--secondary-color)] text-[var(--primary-color)] px-4 py-2 rounded">Create</button>
          <button onClick={handleToggle} className="border-2 cursor-pointer border-[var(--accent-color)] px-4 py-2 rounded text-white">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
