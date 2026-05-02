import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ImageSlider.module.css';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <div className={styles.slider}>
      <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevSlide}>
        <ChevronLeft size={24} />
      </button>
      
      <div className={styles.slidesContainer} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((img, index) => (
          <div key={index} className={styles.slide}>
            <img src={img.url} alt={img.title || `Slide ${index + 1}`} />
            <div className={styles.content}>
              <h2 className="animate-up">{img.title}</h2>
              <p className="animate-up stagger-1">{img.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button className={`${styles.navBtn} ${styles.next}`} onClick={nextSlide}>
        <ChevronRight size={24} />
      </button>

      <div className={styles.dots}>
        {images.map((_, index) => (
          <button 
            key={index} 
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
