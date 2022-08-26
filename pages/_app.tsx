import dynamic from 'next/dynamic';
import React from 'react';

import '../styles/globals.css'

const CreateReactAppEntryPoint = dynamic(() => import('./index'), {
  ssr: false,
});

function MyApp() {
  return <CreateReactAppEntryPoint />;
}

export default MyApp;
