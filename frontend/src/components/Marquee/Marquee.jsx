const Marquee = ({ items = [] }) => {
  return (
    <div className="marquee">
      <div className="marquee-content">
        {items.map((item, index) => (
          <div key={index} className="marquee-item">
            {typeof item === 'string' ? (
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>{item}</span>
            ) : (
              item
            )}
          </div>
        ))}
        {/* Duplicate for seamless scrolling */}
        {items.map((item, index) => (
          <div key={`dup-${index}`} className="marquee-item">
             {typeof item === 'string' ? (
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>{item}</span>
            ) : (
              item
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
