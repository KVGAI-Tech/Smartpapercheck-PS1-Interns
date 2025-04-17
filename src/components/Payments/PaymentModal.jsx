import React, { useEffect, useRef, useState } from "react";
import { Modal, Box, Button, TextField } from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";

export default function PaymentModal() {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(0);

  const amountInputRef = useRef();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePayment = () => {
    const token = localStorage.getItem("accessToken");

    const amount = parseFloat(
      amountInputRef.current.children[1].children[0].value
    );
    const conversionFactor = 1;

    axios
      .post(
        `${API_BASE_URL}/api/transactions/initiate`,
        {
          amount,
          description: `Payment of ${amount} rupees for ${
            amount * conversionFactor
          } credits`,
          metadata: {},
          provider: "PhonePe",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/transactions/balance`)
      .then((res) => {
        setCredits(res.data.data.balance);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="py-4 flex items-center gap-4">
      <button
        onClick={handleOpen}
        className="bg-green-200 hover:bg-green-300 text-green-700 px-4 py-2 rounded-md"
      >
        Buy Credits
      </button>
      <h1>{credits}</h1>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="phonepe-payment-modal"
        aria-describedby="phonepe-payment-description"
      >
        <Box
          className="
            absolute top-1/2 left-1/2 
            transform -translate-x-1/2 -translate-y-1/2 
            bg-white p-6 rounded-lg shadow-lg
            w-full max-w-sm
          "
        >
          <h6 className="text-gray-800 font-normal mb-4 text-xl">
            Enter Amount
          </h6>

          <TextField
            type="number"
            label="Amount"
            variant="outlined"
            fullWidth
            className="mb-4"
            ref={amountInputRef}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="contained"
              color="success"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handlePayment}
            >
              Pay
            </Button>
            <Button
              variant="outlined"
              color="error"
              className="hover:bg-red-50"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
