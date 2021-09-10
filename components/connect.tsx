import React from 'react'
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'
import { Container, Button, Grid, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

import { useEagerConnect, useInactiveListener } from '../hooks'
import {
  injected
} from '../connectors'

import { Transfer } from './transfer'

const useStyles = makeStyles((theme) => ({
  alert: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));


function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Only support Ropsten Network"
  } else if (
    error instanceof UserRejectedRequestErrorInjected
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

function App() {
  const classes = useStyles();
  const context = useWeb3React<Web3Provider>()
  const { connector, library, account, activate, deactivate, active, error } = context
  const [alert, setAlert] = useState(false);

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState<any>()
  React.useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector)

  const currentConnector = injected
  const activating = currentConnector === activatingConnector
  const connected = currentConnector === connector
  const disabled = !triedEager || !!activatingConnector || connected || !!error

  return (
    <>
      <Grid style={{ marginTop: 24 }}>
        {!active ? (
          <Button
            variant="outlined"
            disabled={disabled}
            onClick={() => {
              setActivatingConnector(currentConnector)
              activate(injected)
            }}
          >
            Connect
          </Button>) : (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                deactivate()
              }}
            >
              Disconnect
            </Button>
            <Container maxWidth="md" style={{ marginTop: 24 }}>
              <Transfer library={library} account={account} />
            </Container>
          </>
        )
        }
      </Grid>

      <div>
        {!!error && (
          <Snackbar
            style={{ height: "100%" }}
            open={!!error}
            autoHideDuration={3000}
            onClose={() => setAlert(false)}
          >
            <Alert severity={"error"}>{getErrorMessage(error)}</Alert>
          </Snackbar>
        )}
      </div>

      <div>
        {!!(library && account) && (
          <Grid style={{ marginTop: 24 }}>
            <Button
              variant="outlined"
              onClick={() => {
                library
                  .getSigner(account)
                  .signMessage('👋')
                  .then((signature: any) => {
                    window.alert(`Success!\n\n${signature}`)
                  })
                  .catch((error: any) => {
                    window.alert('Failure!' + (error && error.message ? `\n\n${error.message}` : ''))
                  })
              }}
            >
              Sign In Message
            </Button>
          </Grid>
        )}
      </div>
    </>
  )
}

export default function connect() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  )
}