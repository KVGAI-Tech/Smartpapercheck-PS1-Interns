import React, { useState } from "react";
import { Modal, Box, Button, Typography, TextField } from "@mui/material";

export default function PaymentModal() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handlePayment = () => {
    // TODO: Integrate your PhonePe payment logic here
    console.log("Payment initiated using PhonePe!");
    // Example:
    // fetch('/your-phonepe-endpoint', { ... })
    //   .then(response => response.json())
    //   .then(data => console.log(data));
  };

  return (
    <div className="py-4">
      {/* <Button
        variant="contained"
        onClick={handleOpen}
        className="bg-indigo-600"
      >
        Buy Credits
      </Button> */}
      <button
        onClick={handleOpen}
        className="bg-green-200 hover:bg-green-300 text-green-700 px-4 py-2 rounded-md"
      >
        Buy Credits
      </button>

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
