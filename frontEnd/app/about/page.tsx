export default function AboutPage() {
  return (
    <div style={styles.container}>
      {/* Header Section */}
      <section style={styles.header}>
        <h1 style={styles.title}>About PDF Reader & Editor</h1>
        <p style={styles.subtitle}>
          Your ultimate solution for viewing, editing, and managing PDF files—all in one place.
        </p>
      </section>

      {/* Mission Section */}
      <section style={styles.section}>
        <div style={styles.sectionText}>
          <h2 style={styles.sectionTitle}>Our Mission</h2>
          <p>
            We aim to streamline your document workflow by offering powerful tools to view, edit,
            annotate, and manage PDF files in a seamless and user-friendly interface.
          </p>
        </div>
        <div style={styles.sectionImage}>
          <img
            src="/images/mission.png"
            alt="Our Mission"
            style={styles.icon}
          />
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitleCenter}>What We Offer</h2>
        <div style={styles.featuresContainer}>
          <div style={styles.featureCard}>
            <img
              src="/images/edit.png"
              alt="Edit PDF"
              style={styles.icon}
            />
            <h3 style={styles.featureTitle}>Edit PDFs with ease</h3>
            <p>Modify text, images, and layout in your PDF files with our powerful editing tools.</p>
          </div>
          <div style={styles.featureCard}>
            <img
              src="/image1.webp"
              alt="Annotate PDF"
              style={styles.icon}
            />
            <h3 style={styles.featureTitle}>Annotate PDFs</h3>
            <p>Add comments, highlight text, and draw directly on your PDF documents.</p>
          </div>
          <div style={styles.featureCard}>
            <img
              src="/images/secure.png"
              alt="Secure PDF"
              style={styles.icon}
            />
            <h3 style={styles.featureTitle}>Secure PDF Handling</h3>
            <p>We ensure your documents are safe with encrypted storage and secure sharing options.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={styles.section}>
        <div style={styles.sectionText}>
          <h2 style={styles.sectionTitle}>Why Choose Us?</h2>
          <p>
            At <strong>PDF Reader & Editor</strong>, we prioritize simplicity and efficiency. Our platform
            is tailored to help users manage their PDFs without hassle, directly from the browser. No
            installations required—just log in and get started!
          </p>
        </div>
        <div style={styles.sectionImage}>
          <img
            src="/images/why.png"
            alt="Why Choose Us"
            style={styles.icon}
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={styles.ctaSection}>
        <button style={styles.ctaButton}>Try Now</button>
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0070f3',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#555',
  },
  section: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem',
  },
  sectionTitleCenter: {
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '2rem',
  },
  sectionText: {
    flex: 1,
    paddingRight: '1.5rem',
  },
  sectionImage: {
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
  },
  featuresContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  featureCard: {
    textAlign: 'center',
    flex: 1,
    margin: '0 1rem',
    padding: '1.5rem',
    border: '1px solid #eaeaea',
    borderRadius: '10px',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  ctaSection: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  ctaButton: {
    backgroundColor: '#0070f3',
    color: '#fff',
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  ctaButtonHover: {
    backgroundColor: '#005bb5',
  },
};
