import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from "sonner"
// import { PersistGate } from 'redux-persist/integration/react'
import { NuqsAdapter } from "nuqs/adapters/react";
import Provider from 'react-redux'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <Provider> */}
      {/* <PersistGate loading={null} > */}
        <NuqsAdapter>
          <App />
        </NuqsAdapter>
        <Toaster
          position='top-center'
          expand={true}
          duration={500}
          richColors
          closeButton
        />
      {/* </PersistGate> */}
    {/* </Provider> */}
  </StrictMode>,
)
