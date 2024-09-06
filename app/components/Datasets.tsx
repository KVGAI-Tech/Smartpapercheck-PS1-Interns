"use client";

import { title } from "process";
import React, { useState } from "react";

const datasets = [
  { category: "Retail", name: "Retail Datasets" },
  { category: "Stock Market", name: "Stock Market Datasets" },
  { category: "Housing", name: "Housing Prices Dataset" },
  { category: "Housing", name: "Boston Housing Dataset" },
  { category: "Housing", name: "Melbourne Housing Datasets" },
  { category: "Clinical Trials", name: "Clinical Trials Datasets" },
  { category: "Social Media", name: "YouTube Datasets" },
  { category: "Social Media", name: "Instagram Datasets" },
  { category: "Real Estate", name: "Boston Housing Dataset" },
];

const categories = [
  "All",
  "Business",
  "eCommerce",
  "Real Estate",
  "Social Media",
  "Finance",
];

const features = [
  {
    title: "DATASET MARKETPLACE",
    description: "Access pre-built datasets from popular websites.",
  },
  {
    title: "CUSTOM DATASETS",
    description: "Generate custom datasets with our dataset creation platform.",
  },
  {
    title: "MANAGED SERVICES",
    description:
      "Get 100% hands-free data collection operations and management.",
  },
];

const DatasetList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesCategory =
      selectedCategory === "All" || dataset.category === selectedCategory;
    const matchesSearch = dataset.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 w-[100%] bg-[#f6f8ff]">
      <p className="m-0 text-4xl pb-12 pt-4 text-center text-[#303b45]">
        Any dataset. Every business need.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 p-6 pl-20 pr-20 pb-20 ">
        {features?.map((feature) => (
          <div
            key={feature.title}
            className="p-6 bg-white rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-12">{feature.title}</h3>
            <button className="text-blue-500 hover:underline font-bold ">
              {`Get dataset  >`}
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search for a dataset"
          className="px-4 py-2 border rounded-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDatasets.map((dataset) => (
          <div key={dataset.name} className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-12">{dataset.name}</h3>
            <button className="text-blue-500 hover:underline font-bold ">
              {`Get dataset  >`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatasetList;
