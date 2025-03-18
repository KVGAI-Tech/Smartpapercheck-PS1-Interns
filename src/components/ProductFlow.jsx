import React from 'react';

const ProductFlow = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-blue-900">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="md:w-1/2">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Answer Scripts</h3>
                  <p className="text-gray-600">Upload scanned answer scripts in bulk or individually in PDF format.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Set Evaluation Criteria</h3>
                  <p className="text-gray-600">Define marking schemes, rubrics, and evaluation parameters.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Evaluation</h3>
                  <p className="text-gray-600">Our AI analyzes and grades answers based on your criteria.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">4</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Review & Export</h3>
                  <p className="text-gray-600">Review AI-generated grades and export detailed reports.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/product-flow.svg" 
              alt="Product Flow" 
              className="w-full max-w-lg mx-auto" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductFlow; 