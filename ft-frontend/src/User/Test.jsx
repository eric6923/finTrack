import React, { useState } from 'react';

const Test = () => {
  return (
    <div className="flex flex-col items-start gap-4 mt-5 ml-5">
      <div className="flex items-start gap-5">
        <div className="flex items-center">
          <div className="text-base">You'll Give:&nbsp;</div>
          {/* Display the green logo */}
          <img src="src/assets/green.png" alt="Green Logo" className="w-4 h-4" />
        </div>

        <div className="w-5"></div> {/* Spacer between logos */}

        <div className="flex items-center">
          <div className="text-base">You'll Get:&nbsp;</div>
          {/* Display the red logo */}
          <img src="src/assets/red.png" alt="Red Logo" className="w-4 h-4" />
        </div>

        {/* Balance Section placed after You'll Get */}
        <div className="flex items-center">
          <div className="text-base">Balance:&nbsp;</div>
          <div className="text-xl font-semibold">₹500</div>
        </div>
      </div>

      {/* Add the Search Bar Below */}
      <Input />

      {/* Add both the existing Dropdown and the SelectMenu */}
      <Dropdown />
      <SelectMenu />
    </div>
  );
};

const Input = () => {
  return (
    <div className="relative flex items-center max-w-[190px]">
      <svg
        className="absolute left-4 fill-gray-400 w-4 h-4"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <g>
          <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
        </g>
      </svg>
      <input
        placeholder="Search"
        type="search"
        className="w-full h-7 pl-10 pr-3 border-2 border-transparent rounded-lg bg-gray-100 text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 hover:bg-blue-50"
      />
    </div>
  );
};

const Dropdown = () => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className="relative mt-4 ml-2">
      <button
        className="flex items-center justify-between px-2 py-1 rounded-md border-2 border-blue-500 text-blue-500 text-sm"
        onClick={toggleDropdown}
        aria-haspopup="true"
      >
        <span className="mr-2">
          <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.33355 8.33333H8.66688C8.87928 8.33357 9.08358 8.4149 9.23802 8.56071C9.39247 8.70651 9.48541 8.90579 9.49786 9.11783C9.51031 9.32986 9.44132 9.53865 9.305 9.70153C9.16867 9.8644 8.9753 9.96908 8.76438 9.99417L8.66688 10H5.33355C5.12115 9.99976 4.91686 9.91843 4.76241 9.77263C4.60796 9.62682 4.51502 9.42754 4.50257 9.2155C4.49012 9.00347 4.55911 8.79468 4.69544 8.63181C4.83176 8.46893 5.02514 8.36425 5.23605 8.33917L5.33355 8.33333H8.66688H5.33355ZM3.66688 4.16667H10.3335C10.5459 4.1669 10.7502 4.24823 10.9047 4.39404C11.0591 4.53985 11.1521 4.73913 11.1645 4.95116C11.177 5.1632 11.108 5.37198 10.9717 5.53486C10.8353 5.69774 10.642 5.80241 10.4311 5.8275L10.3335 5.83333H3.66688C3.45448 5.8331 3.25019 5.75177 3.09574 5.60596C2.9413 5.46015 2.84835 5.26087 2.83591 5.04884C2.82346 4.8368 2.89244 4.62802 3.02877 4.46514C3.1651 4.30226 3.35847 4.19759 3.56938 4.1725L3.66688 4.16667H10.3335H3.66688ZM1.16688 0H12.8335C13.0459 0.00023559 13.2502 0.0815658 13.4047 0.227373C13.5591 0.373181 13.6521 0.572461 13.6645 0.784496C13.677 0.99653 13.608 1.20532 13.4717 1.36819C13.3353 1.53107 13.142 1.63575 12.9311 1.66083L12.8335 1.66667H1.16688C0.954483 1.66643 0.750189 1.5851 0.595742 1.43929C0.441295 1.29349 0.348354 1.09421 0.335906 0.882171C0.323458 0.670136 0.392445 0.461351 0.52877 0.298473C0.665095 0.135595 0.858469 0.0309197 1.06938 0.00583331L1.16688 0H12.8335H1.16688Z"
              fill="#737373"
            ></path>
          </svg>
        </span>
        Select
      </button>

      {open && (
        <ul className="absolute mt-2 w-[160px] bg-white border rounded-md shadow-lg text-sm">
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">All</li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">You'll Give</li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">You'll Get</li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">Settled</li>
        </ul>
      )}
    </div>
  );
};

const SelectMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <div className="relative mt-4 ml-2">
      <button
        className="flex items-center justify-between px-2 py-1 rounded-md border-2 border-blue-500 text-blue-500 text-sm"
        onClick={toggleDropdown}
        aria-haspopup="true"
      >
        <span className="mr-2">
          {/* Double Arrow Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="10"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              d="M8 0l6 6-6 6M0 0l6 6-6 6"
              stroke="#737373"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </span>
        Select Menu
      </button>

      {open && (
        <ul className="absolute mt-2 w-[160px] bg-white border rounded-md shadow-lg text-sm">
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">Option 1</li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">Option 2</li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">Option 3</li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-200">Option 4</li>
        </ul>
      )}
    </div>
  );
};

export default Test;
