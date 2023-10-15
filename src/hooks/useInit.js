/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

import { initiateSmartWallet } from "./initiateSmartWallet";
import { initiateEOA } from "./initiateEOA";
import Config from "../config";
import { getItemFromStorage } from "../utils/helper";
import { useAuth } from "./useAuth";

export default function useInit() {
  const [signer, setSigner] = useState(null);
  const [smartAccountProvider, setSmartAccountProvider] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  const auth = useAuth();

  const device = getItemFromStorage('device');

  const isLoggedIn = auth.isLoggedIn;
  
  useEffect(() => {
    if (!deviceId) {
      setDeviceId(device.id);
      getEOA();
    }
  }, [deviceId]);

  const rpcUrl = Config.RPC_MUMBAI;
  const bundlerUrl = Config.BUNDLER_MUMBAI;
  const chainId = Config.CHAINID_MUMBAI;
  const paymasterUrl = Config.PAYMASTER_MUMBAI;

  const getEOA = initiateEOA(device.id, setSigner, rpcUrl, setProvider);
  const getSmartWalletHandler = initiateSmartWallet(rpcUrl, bundlerUrl, chainId, paymasterUrl, signer, auth.login, setSmartAccountProvider, setSmartAccountAddress);

  return {
    isLoggedIn,
    smartAccountProvider,
    smartAccountAddress,
    provider,
    getSmartWalletHandler,
    getEOA,
  };
}