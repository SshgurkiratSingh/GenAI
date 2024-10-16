export default function AboutPage() {
  return (
    <div className="container">
      {/* Header Section */}
      <section className="header">
        <h1 className="title">About PDF Reader & Editor</h1>
        <p className="subtitle">
          Your ultimate solution for viewing, editing, and managing PDF files—all in one place.
        </p>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="section-text">
          <h2 className="section-title">Our Mission</h2>
          <p>
            We aim to streamline your document workflow by offering powerful tools to view, edit,
            annotate, and manage PDF files in a seamless and user-friendly interface.
          </p>
        </div>
        <div className="section-image">
          <img
            src="mission.jfif"
            alt="Our Mission"
            className="icon"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <h2 className="section-title center">What We Offer</h2>
        <div className="features-container">
          <div className="feature-card">
            <img
              src="/edit.jpg"
              alt="Edit PDF"
              className="icon"
            />
            <h3 className="feature-title">Edit PDFs with ease</h3>
            <p>Modify text, images, and layout in your PDF files with our powerful editing tools.</p>
          </div>
          <div className="feature-card">
            <img
              src="/image1.webp"
              alt="Annotate PDF"
              className="icon"
            />
            <h3 className="feature-title">Annotate PDFs</h3>
            <p>Add comments, highlight text, and draw directly on your PDF documents.</p>
          </div>
          <div className="feature-card">
            <img
              src="/images/secure.png"
              alt="Secure PDF"
              className="icon"
            />
            <h3 className="feature-title">Secure PDF Handling</h3>
            <p>We ensure your documents are safe with encrypted storage and secure sharing options.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="section">
        <div className="section-text">
          <h2 className="section-title">Why Choose Us?</h2>
          <p>
            At <strong>PDF Reader & Editor</strong>, we prioritize simplicity and efficiency. Our platform
            is tailored to help users manage their PDFs without hassle, directly from the browser. No
            installations required—just log in and get started!
          </p>
        </div>
        <div className="section-image">
          <img
            src="/images/why.png"
            alt="Why Choose Us"
            className="icon"
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <button className="cta-button">Try Now</button>
      </section>

      
    </div>
  );
}
