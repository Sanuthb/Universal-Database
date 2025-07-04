import React from 'react'

const Navbar = () => {
  return (
    <div className="border-b-2 border-[var(--border-color)] w-full bg-[var(--primary-color)] text-[var(--secondary-color)] p-2 flex items-center justify-between">
        <div className='w-1/2 '>
            <h1>Universal DB Connector</h1>
        </div>
        <div className='w-1/2 flex items-center justify-end'>
            <div className='flex items-center justify-center bg-green-600 w-8 h-8  rounded '>
                S
            </div>
        </div>
    </div>
  )
}

export default Navbar