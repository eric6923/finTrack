import React, { useState } from 'react';

const Prospects = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [prospects, setProspects] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('You Got'); // State for select dropdown

  const handleAddProspect = () => {
    const newProspect = { name, phone, amount, amountType };
    setProspects([...prospects, newProspect]);
    setName('');
    setPhone('');
    setAmount('');
    setAmountType('You Got');
    setFormVisible(false);
  };

  const handleDeleteProspect = (index) => {
    const updatedProspects = prospects.filter((_, i) => i !== index);
    setProspects(updatedProspects);
  };

  return (
    <div className="relative p-4 min-h-screen bg-gray-100 pl-64">
      {/* <h1>Welcome to the Prospects page!</h1> */}

      <div className="mt-4">
        {/* <h2>Prospects List:</h2> */}
        <ul>
          {prospects.map((prospect, index) => (
            <li key={index} className="flex items-center">
              {prospect.name} - {prospect.amount} {prospect.amountType}
              <button
                onClick={() => handleDeleteProspect(index)}
                className="ml-4 p-2"
              >
                <img
                  src="src/assets/bin.png"
                  alt="Delete"
                  className="w-6 h-6"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Prospects Button */}
      <button
        className="bg-blue-500 text-white p-2 rounded fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30"
        onClick={() => setFormVisible(true)}
      >
        Add Prospects
      </button>

      {/* Backdrop when form is visible */}
      {isFormVisible && (
        <div className="fixed inset-0 bg-black opacity-50 z-10"></div>
      )}

      {/* Form for adding a prospect */}
      {isFormVisible && (
        <div className="absolute top-0 right-0 p-4 w-80 h-full border border-gray-300 bg-white rounded-l shadow-lg z-20">
          <div className="flex justify-between">
            <h3>Add Prospect Details</h3>
            <button
              onClick={() => setFormVisible(false)}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter Name'
              className="block mt-2 p-2 border border-gray-300 w-full"
              required
            />
          </div>
          <div>
            <label>Phone Number: (optional)</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Enter Phone Number'
              className="block mt-2 p-2 border border-gray-300 w-full"
            />
          </div>

          {/* Amount input with currency symbol and dropdown */}
          <div className="MuiFormControl-root MuiTextField-root css-i44wyl mt-2">
            <label className="block">Amount:</label>
            <div className="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-colorPrimary MuiInputBase-formControl MuiInputBase-sizeSmall MuiInputBase-adornedStart MuiInputBase-adornedEnd css-6vl303 mt-1">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedStart MuiInputBase-inputAdornedEnd css-1y3zh1 w-40" // Reduced width
              />
              <select
                value={amountType}
                onChange={(e) => setAmountType(e.target.value)}
                className={`ml-2 ${amountType === 'You Got' ? 'text-green-500' : 'text-red-500'}`} // Change text color based on selection
              >
                <option value="You Got" className="text-green-500">You Got</option>
                <option value="You Gave" className="text-red-500">You Gave</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddProspect}
            className="bg-green-500 text-white p-2 mt-4 rounded w-full"
          >
            Add Prospect
          </button>
        </div>
      )}
    </div>
  );
};

export default Prospects;
