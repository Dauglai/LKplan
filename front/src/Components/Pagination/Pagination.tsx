import React from "react";
// import classes from './MySelect.module.css'

const Pagination =  function ({pagesArray, page, changePage}) {
  return (
    <div className='page__wrapper'>
      {pagesArray.map(p  =>
        <span
          onClick={() => changePage(p)}
          className={page === p ? 'page page__current' : 'page'}
          key={p}>
                {p}
            </span>
      )}
    </div>
  )
}

export default Pagination;