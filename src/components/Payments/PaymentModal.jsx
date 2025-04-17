import React, { useEffect, useRef, useState } from "react";
import { Modal, Box, Button, TextField, CircularProgress } from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../BaseURL";

export default function PaymentModal() {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [error, setError] = useState(null);

  const amountInputRef = useRef();

  const handleOpen = () => {
    setOpen(true);
    setPaymentUrl(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setPaymentUrl(null);
    setError(null);
  };

  const handlePayment = () => {
    const token = localStorage.getItem("accessToken");
    const amount = parseFloat(amountInputRef.current.value);

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const conversionFactor = 1;
    setLoading(true);
    setError(null);

    axios
      .post(
        `${API_BASE_URL}/api/transactions/initiate`,
        {
          amount,
          description: `Payment of ${amount} rupees for ${
            amount * conversionFactor
          } credits`,
          metadata: {
            user_id: 123,
            reference_id: "order_123",
          },
          provider: "phonepe",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log("Payment initiated:", res.data.data);
        if (res.data.data.redirect_url) {
          setPaymentUrl(res.data.data.redirect_url);
        } else {
          // Handle in-app redirect for PhonePe
          window.open(res.data.data.redirect_url, "_blank");
          //   checkPaymentStatus(res.data.data.transaction_id);
        }
      })
      .catch((err) => {
        console.error("Payment initiation error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to initiate payment. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //   const checkPaymentStatus = (transactionId) => {
  //     const token = localStorage.getItem("accessToken");
  //     // Poll for payment status every 5 seconds
  //     const interval = setInterval(() => {
  //       axios
  //         .get(`${API_BASE_URL}/api/transactions/${transactionId}/verify`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         })
  //         .then((res) => {
  //           const status = res.data.data.status;
  //           if (status === "SUCCESS") {
  //             clearInterval(interval);
  //             fetchBalance();
  //             handleClose();
  //             // Show success notification
  //             alert("Payment successful! Credits added to your account.");
  //           } else if (status === "FAILED" || status === "CANCELLED") {
  //             clearInterval(interval);
  //             setError("Payment was not successful. Please try again.");
  //           }
  //           // Continue polling for PENDING status
  //         })
  //         .catch((err) => {
  //           console.error("Error checking payment status:", err);
  //           clearInterval(interval);
  //           setError("Failed to verify payment status. Please contact support.");
  //         });
  //     }, 5000);

  //     // Clear interval after 2 minutes (assuming timeout)
  //     setTimeout(() => {
  //       clearInterval(interval);
  //     }, 120000);
  //   };

  const handlePhonePeRedirect = () => {
    if (paymentUrl) {
      // Open the payment URL in a new tab/window
      window.open(paymentUrl, "_blank");
      // Start checking for payment status
      const transactionId = new URLSearchParams(new URL(paymentUrl).search).get(
        "transactionId"
      );
      if (transactionId) {
        // checkPaymentStatus(transactionId);
      }
    }
  };

  const fetchBalance = () => {
    const token = localStorage.getItem("accessToken");
    axios
      .get(`${API_BASE_URL}/api/transactions/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCredits(res.data.data.balance);
      })
      .catch((err) => {
        console.error("Error fetching balance:", err);
      });
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="py-4 flex items-center gap-4">
      <button
        onClick={handleOpen}
        className="bg-green-200 hover:bg-green-300 text-green-700 px-4 py-2 rounded-md"
      >
        Buy Credits
      </button>
      <h1>Credits: {credits}</h1>

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
          {!paymentUrl ? (
            <>
              <h6 className="text-gray-800 font-normal mb-4 text-xl">
                Enter Amount to Add Credits
              </h6>

              <TextField
                type="number"
                label="Amount (₹)"
                variant="outlined"
                fullWidth
                className="mb-4"
                inputRef={amountInputRef}
                error={!!error}
                helperText={error}
                disabled={loading}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="contained"
                  color="success"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Pay with PhonePe"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  className="hover:bg-red-50"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <h6 className="text-gray-800 font-normal mb-4 text-xl text-center">
                Complete Your Payment
              </h6>

              <div className="flex flex-col items-center mb-4">
                <img
                  src="/api/placeholder/100/100"
                  alt="PhonePe Logo"
                  className="w-16 h-16 mb-4"
                />
                <p className="text-center mb-4">
                  Click the button below to complete your payment via PhonePe
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handlePhonePeRedirect}
                >
                  Proceed to PhonePe
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  className="hover:bg-red-50"
                  onClick={handleClose}
                >
                  Cancel Payment
                </Button>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
