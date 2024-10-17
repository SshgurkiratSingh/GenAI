import Link from "next/link"; // Import Link from Next.js

export default function AboutPage() {
  return (
    <div className="container flex flex-col items-center gap-10 px-4 py-8">
      {/* Header Section */}
      <section className="header shadow-xl shadow-slate-500 p-10 w-full max-w-4xl text-center">
        <h1 className="gradient-text2 title text-4xl font-bold mb-4">
          About PDF Reader & Editor
        </h1>
        <p className="subtitle text-lg">
          Your ultimate solution for viewing, editing, and managing PDF files—all in one place.
        </p>
      </section>

      {/* Mission Section */}
      <section className="section shadow-xl shadow-slate-500 p-6 w-full max-w-4xl flex flex-col items-center">
        <div className="section-text text-center mb-6">
          <h2 className="section-title text-3xl font-semibold mb-4 gradient-text2">
            Our Mission
          </h2>
          <p>
            We aim to streamline your document workflow by offering powerful tools to view, edit, annotate, and manage PDF files in a seamless and user-friendly interface.
          </p>
        </div>
        <div className="section-image">
          <img src="mission.jfif" alt="Our Mission" className="icon w-48 h-auto" />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-10 shadow-xl shadow-slate-500">
        <h2 className="section-title text-center mb-8 gradient-text2">What We Offer</h2>
        <div className="flex w-full justify-between max-w-6xl mx-auto gap-6 px-6">
          <div className="feature-card flex flex-col items-center p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <img src="/edit.jpg" alt="Edit PDF" className="icon w-20 mb-4 hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold mb-2 gradient-text2">Edit PDFs with ease</h3>
            <p className="text-center">
              Modify text, images, and layout in your PDF files with our powerful editing tools.
            </p>
          </div>

          <div className="feature-card flex flex-col items-center p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <img src="/image1.webp" alt="Annotate PDF" className="icon w-20 mb-4 hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-semibold mb-2 gradient-text2">Annotate PDFs</h3>
            <p className="text-center">
              Add comments, highlight text, and draw directly on your PDF documents.
            </p>
          </div>

          <div className="feature-card flex flex-col items-center p-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <img src="/lock.png" alt="secure pdf" />
            <h3 className="text-xl font-semibold mb-2 gradient-text2">Secure PDF Handling</h3>
            <p className="text-center">
              We ensure your documents are safe with encrypted storage and secure sharing options.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section shadow-xl shadow-slate-500 p-6 w-full max-w-4xl flex flex-col items-center mb-10">
        <div className="section-text text-center">
          <h2 className="section-title text-3xl font-semibold mb-4 gradient-text2">
            Why Choose Us?
          </h2>
          <p>
            At <strong>PDF Reader & Editor</strong>, we prioritize simplicity and efficiency. Our platform is tailored to help users manage their PDFs without hassle, directly from the browser. No installations required—just log in and get started!
          </p>
        </div>
        <div className="section-image mt-6">
          <img src="images.jpeg" alt="Why Choose Us" className="icon w-48 h-auto" />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="p-6 w-full max-w-4xl text-center">
        {/* Wrap the button with Link component to navigate to HomePage */}
        <Link href="/" passHref>
          <button className="cta-button bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
            Try Now
          </button>
        </Link>
      </section>
    </div>
  );
}