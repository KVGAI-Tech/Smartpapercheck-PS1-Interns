import Image from 'next/image';

export default function ProductFlow() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-blue-900">Our Product Flow</h2>
        <div className="flex justify-center">
          <Image src="/herimage.svg" alt="Product Flow" width={800} height={400} className="rounded-lg shadow-lg" />
        </div>
      </div>
    </section>
  );
}

