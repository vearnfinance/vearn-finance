import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  TextField,
  Button
} from '@material-ui/core';
import { withNamespaces } from 'react-i18next';
import i18n from '../../i18n';
import Web3 from 'web3';

import GatewayJS from "@renproject/gateway-js";

import {
  GET_YIELD_RETURNED,
  GET_YIELD_RETURNED_RETURNED,
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '1000px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '60px',
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
      marginTop: '0px',
    }
  },
  introCenter: {
    maxWidth: '500px',
    textAlign: 'center',
    display: 'flex',
    padding: '48px 0px'
  },
  actionInput: {
    padding: '0px 0px 12px 0px',
    fontSize: '0.5rem'
  },
  actionButton: {
    '&:hover': {
      backgroundColor: "#2F80ED",
    },
    padding: '12px',
    backgroundColor: "#2F80ED",
    borderRadius: '1rem',
    border: '1px solid #E1E1E1',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      padding: '15px',
    }
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
  },
  tradeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 12px 24px 12px',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      padding: '0px 12px 24px 12px',
    }
  },
  sepperator: {
    borderBottom: '1px solid #E1E1E1',
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
});

class DepositBTC extends Component {

  constructor() {
    super()

    this.state = {
      account:  store.getStore('account'),
      loading: false,
      amount: '',
      amountError: null,
      gatewayJS: new GatewayJS("testnet")
    }
  }

  componentWillMount() {
    // emitter.on(GET_YIELD_RETURNED, this.yieldReturned);
    // dispatcher.dispatch({ type: GET_YIELD, content: {  } })
  }

  componentWillUnmount() {
    // emitter.removeListener(GET_YIELD_RETURNED, this.yieldReturned);
  };

  render() {
    const { classes, t } = this.props;
    const {
      depositAmountError,
      depositAmount,
      withdrawAmountError,
      withdrawAmount,
      loading,
    } = this.state

    return (
      <React.Fragment>
        <div className={classes.tradeContainer}>
          <div className={ classes.amountContainer }>
            <TextField
              fullWidth
              className={ classes.actionInput }
              id='depositAmount'
              value={ depositAmount }
              error={ depositAmountError }
              onChange={ this.onChange }
              disabled={ loading }
              label=""
              size="small"
              placeholder="0.00"
              variant="outlined"
              onKeyDown={ this.depositKeyDown }
            />
          </div>
          <Button
            className={ classes.actionButton }
            variant="outlined"
            color="primary"
            disabled={ loading }
            onClick={ this.onDeposit }
            >
            <Typography className={ classes.buttonText } variant={ 'h5'} color='secondary'>{ t('ConvertBTC.Deposit') }</Typography>
          </Button>
        </div>
        <div className={classes.tradeContainer}>
          <div className={ classes.amountContainer }>
            <TextField
              fullWidth
              className={ classes.actionInput }
              id='withdrawAmount'
              value={ withdrawAmount }
              error={ withdrawAmountError }
              onChange={ this.onChange }
              disabled={ loading }
              label=""
              size="small"
              placeholder="0.00"
              variant="outlined"
              onKeyDown={ this.withdrawKeyDown }
            />
          </div>
          <Button
            className={ classes.actionButton }
            variant="outlined"
            color="primary"
            disabled={ loading }
            onClick={ this.onWithdraw }
            >
            <Typography className={ classes.buttonText } variant={ 'h5'} color='secondary'>{ t('ConvertBTC.Withdraw') }</Typography>
          </Button>
        </div>
      </React.Fragment>
    )
  };

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)
  };

  depositKeyDown = (event) => {
    if (event.which === 13) {
      this.onDeposit();
    }
  };

  withdrawKeyDown = (event) => {
    if (event.which === 13) {
      this.onWithdraw();
    }
  };

  onDeposit = async () => {
    const { gatewayJS, amount, account } = this.state;

    const web3 = new Web3(store.getStore('web3context').library.provider);

    try {
      await gatewayJS.open({
        // Send BTC from the Bitcoin blockchain to the Ethereum blockchain.
        sendToken: GatewayJS.Tokens.BTC.Btc2Eth,

        // Amount of BTC we are sending (in Satoshis)
        suggestedAmount: Math.floor(amount * (10 ** 8)), // Convert to Satoshis

        // The contract we want to interact with
        sendTo: '0xb2731C04610C10f2eB6A26ad14E607d44309FC10',

        contractFn: "deposit",

        // The nonce is used to guarantee a unique deposit address.
        nonce: GatewayJS.utils.randomNonce(),

        // Arguments expected for calling `deposit`
        contractParams: [
            {
                name: "_msg",
                type: "bytes",
                value: web3.utils.fromAscii(`Depositing ${amount} BTC`),
            }
        ],
      }).result();

      this.log(`Deposited ${amount} BTC.`);

    } catch (error) {
      // Handle error
      console.error(error);
    }
  }

  onWithdraw = async () => {
    const { gatewayJS, balance, account } = this.state;

    const amount = balance;
    const recipient = prompt("Enter BTC recipient:");

    const web3 = new Web3(store.getStore('web3context').library.provider);

    try {

      await gatewayJS.open({
          // Send BTC from the Ethereum blockchain to the Bitcoin blockchain.
          sendToken: GatewayJS.Tokens.BTC.Eth2Btc,

          // The contract we want to interact with
          sendTo: '0xb2731C04610C10f2eB6A26ad14E607d44309FC10',

          // The name of the function we want to call
          contractFn: "withdraw",

          // Arguments expected for calling `deposit`
          contractParams: [
              { name: "_msg", type: "bytes", value: web3.utils.fromAscii(`Withdrawing ${amount} BTC`) },
              { name: "_to", type: "bytes", value: "0x" + Buffer.from(recipient).toString("hex") },
              { name: "_amount", type: "uint256", value: Math.floor(amount * (10 ** 8)) },
          ],
      }).result();

      this.log(`Withdrew ${amount} BTC to ${recipient}.`);

    } catch (error) {
      // Handle error
      console.error(error);
    }
  }
}

export default withNamespaces()(withRouter(withStyles(styles)(DepositBTC)));
