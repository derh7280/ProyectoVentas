
import {Header} from 'components/Header';
import React from 'react';
import 'styles/layout.css'

export const Layout = ({ children }) => {
  return (
    <div className='mainContainer'>
      <Header />
      <main>{children}</main>
 
    </div>
  );
};
