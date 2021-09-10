import { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Card,
  FormControl,
  Snackbar
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import NumberFormat from "react-number-format";
import { makeStyles } from "@material-ui/core/styles";
import { ethers, utils } from 'ethers';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: "100%",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export const Transfer = (data) => {
  const classes = useStyles();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [alert, setAlert] = useState(false);
  const [alertClass, setAlertClass] = useState("");
  const [alertContent, setAlertContent] = useState("");

  const { library, account } = data

  const showAlert = (alertContent, alertClass) => {
    setAlertContent(alertContent);
    setAlertClass(alertClass);
    setAlert(true);
  };

  const handleChangeAmount = (values) => {
    setAmount(values.value);
  };

  const handleChangeAddress = (event) => {
    setAddress(event.target.value);
  };


  const onTransfer = () => {
    if (!utils.isAddress(address)) {
      showAlert("Invalid Address", "error")
    }
    else {
      const params = [{
        from: account,
        to: address,
        value: ethers.utils.parseUnits(amount, 'ether').toHexString()
      }];

      library.send('eth_sendTransaction', params).then(() => {
        showAlert("Transfer Done", "success")
      })
    }
  };

  return (
    <Card style={{ padding: 24, marginBottom: 24, textAlign: "left" }}>
      <Grid style={{ marginTop: 24 }}>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          style={{ height: "100%" }}
          open={alert}
          autoHideDuration={3000}
          onClose={() => setAlert(false)}
        >
          <Alert severity={alertClass}>{alertContent}</Alert>
        </Snackbar>
        <FormControl className={classes.formControl}>
          <TextField
            onChange={handleChangeAddress}
            id="address"
            label="Address"
            type={"text"}
          />
        </FormControl>
        <FormControl className={classes.formControl}>
          <NumberFormat
            label="Amount"
            value={amount}
            customInput={TextField}
            prefix={'ETH '}
            type="text"
            thousandSeparator={true}
            decimalScale={18}
            onValueChange={(values) => handleChangeAmount(values)}
          />
        </FormControl>
      </Grid>
      <Grid container justifyContent="center" style={{ marginTop: 24, marginBottom: 24 }}>
        <Button
          variant="contained"
          onClick={() => onTransfer()}
        >
          Transfer
        </Button>
      </Grid>
    </Card>
  );
};
