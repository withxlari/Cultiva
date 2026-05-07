import { useState } from 'react';
import styles from './Tooltip.module.css';

export default function Tooltip({ texto, children, posicao = 'top' }) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setVisivel(true)}
      onMouseLeave={() => setVisivel(false)}
    >
      {children}
      {visivel && (
        <div className={`${styles.tooltip} ${styles[posicao]}`}>
          {texto}
        </div>
      )}
    </div>
  );
}