import { useEffect, useState } from 'react';

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!message) return null;

  return (
    <div className={`toast${visible ? '' : ' toast-hidden'}`}>
      {message}
    </div>
  );
}
