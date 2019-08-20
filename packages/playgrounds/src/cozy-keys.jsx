import React from 'react'
import ReactDOM from 'react-dom'
import 'cozy-ui/transpiled/react/stylesheet.css'
import 'cozy-ui/dist/cozy-ui.min.css'
import { VaultProvider, VaultUnlocker } from '../../cozy-keys-lib/dist'


const App = () => (
  <VaultProvider>
    <VaultUnlocker>
      <div>Unlocked</div>
    </VaultUnlocker>
  </VaultProvider>
)

ReactDOM.render(
    <App />,
  document.querySelector('#app')
)
