"use client";

import React, { useState } from "react";

const DatasetPricing = () => {
  const [records, setRecords] = useState(200000);
  const [period, setPeriod] = useState("One-time");
  const pricePerThousand = 2.5;

  const calculatePrice = () => {
    return (records / 1000) * pricePerThousand;
  };

  const buttonStylesActive = "bg-blue-500 text-white px-4 py-2 rounded";
  const buttonStyles = "text-gray-600 px-4 py-2";

  const plans = [
    {
      interval: "One-time",
      discount: null,
    },
    {
      interval: "Biannual",
      discount: 25,
    },
    {
      interval: "Quarterly",
      discount: 50,
    },
    {
      interval: "Monthly",
      discount: 80,
    },
  ];

  return (
    <section className="py-16 w-screen bg-[#f6f8ff]">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Datasets Pricing
        </h2>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Refresh rate</h3>
            <div className="flex space-x-4">
              {plans?.map((plan) => (
                <button
                  key={plan.interval}
                  className={
                    period === plan.interval ? buttonStylesActive : buttonStyles
                  }
                  onClick={() => setPeriod(plan.interval)}
                >
                  {plan.interval}
                  {plan.discount && (
                    <>
                      <br />
                      <span
                        className={`text-xs ${
                          period === plan.interval
                            ? "text-white"
                            : "text-blue-500"
                        }`}
                      >
                        Save {plan.discount}%
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <input
              type="range"
              min="200000"
              max="20000000"
              step="100000"
              value={records}
              onChange={(e) => setRecords(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>200K</span>
              <span>500K</span>
              <span>1M</span>
              <span>5M</span>
              <span>20M</span>
              <span>Complete Dataset</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600">Records</p>
              <p className="text-2xl font-bold">{records.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Price per 1k records</p>
              <p className="text-2xl font-bold">
                ${pricePerThousand.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Refresh discount</p>
              <p className="text-2xl font-bold text-blue-500">0%</p>
            </div>
            <div>
              <p className="text-gray-600">Total Price</p>
              <p className="text-2xl font-bold">
                ${calculatePrice().toFixed(2)}
              </p>
            </div>
          </div>
          <button className="w-full bg-blue-500 text-white py-3 rounded-full mt-6 font-semibold">
            Get Dataset &gt;
          </button>
          <div className="mt-6 flex justify-between text-sm text-gray-600">
            <span>✓ Clean and validated</span>
            <span>✓ Refreshed monthly</span>
            <span>✓ JSON/CSV/Parquet</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DatasetPricing;
