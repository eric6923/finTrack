import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const FullPayment = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isPaid, setIsPaid] = useState(false); // Track if the payment is completed
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Check localStorage on initial render
  useEffect(() => {
    const paymentStatus = localStorage.getItem(`paymentStatus-${transactionId}`);
    console.log('Payment Status from localStorage:', paymentStatus); // Debugging log
    if (paymentStatus === 'paid') {
      setIsPaid(true);
    }
  }, [transactionId]);

  const handleFullPayment = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/user/paylater/${transactionId}`,
        {
          paymentType: 'FULL',
          amount: parseFloat(amount),
        }
      );
      setMessage(response.data.message); // Display success message
      setIsPaid(true); // Mark the payment as completed
      setShowModal(false); // Close the modal after successful payment
      // Save the payment status to localStorage
      localStorage.setItem(`paymentStatus-${transactionId}`, 'paid');
      console.log('Payment status saved to localStorage'); // Debugging log
    } catch (error) {
      console.error('Error making full payment:', error);
      setMessage('Failed to make full payment.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">Full Payment</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          disabled={isPaid} // Disable input if payment is completed
        />
      </div>

      <div className="flex items-center">
        <button
          onClick={() => setShowModal(true)} // Show modal when clicked
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            isPaid ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isPaid} // Disable button if payment is completed
        >
          Mark as Paid
        </button>
        {isPaid && <span className="text-green-500 font-bold ml-4">Paid</span>}
      </div>

      {message && <p className="mt-4">{message}</p>}

      {/* Modal for confirming full payment */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Confirm Full Payment</h4>
            <p className="mb-4">Are you sure you want to proceed with the full payment and mark the transaction as paid?</p>
            <div className="flex justify-around">
              <button
                onClick={handleFullPayment}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Yes, Mark as Paid
              </button>
              <button
                onClick={() => setShowModal(false)} // Close the modal if canceled
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullPayment;
