import React from 'react';

const Pagination = ({ page, last, onPrev, onNext }) => (
  <div className="pagination">
    <button onClick={onPrev} disabled={page === 1}>Prethodna</button>
    <span>Strana {page} od {last}</span>
    <button onClick={onNext} disabled={page === last}>Sledeća</button>
  </div>
);

export default Pagination;