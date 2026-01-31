import { FaArrowUp, FaUniversity } from 'react-icons/fa';
import useScrollToTop from '../hooks/useScrollToTop';

function Footer() {
  const scrollToTop = useScrollToTop();

  return (
    <footer className="footer">
     <FaUniversity size={100}/>
      <div className="footer-content" style={{ display: 'inline-block', margin: 0}}>
        <h3> Fakultet Organizacionih Nauka </h3>
        <p>
          Jove Ilica 154, Beograd, Srbija<br />
          Telefon: +381 11 3370 300<br />
          Email: fon@fon.bg.ac.rs<br />
          Web: <a href="https://www.fon.bg.ac.rs" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-1)' }}>www.fon.bg.ac.rs</a>
        </p>
      </div>
      <button
        className="scroll-top-button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Idi na vrh stranice"
      >
        <FaArrowUp/> Vrh stranice
      </button>
    </footer>
  );
}

export default Footer;
