import {
  BiconomySmartAccount,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import localforage from "localforage";

import {
  setItemInStorage,
  getItemFromStorage,
  generateSHA256Hash,
} from "../../utils/helper";
import { useGetBalance } from "../functional-hooks/useGetBalance";

export function initiateSmartWallet(
  rpcUrl: string,
  bundlerUrl: string,
  chainId: number,
  paymasterUrl: string,
  signer: any,
  login: any,
  setSmartAccountProvider: any,
  setSmartAccountAddress: any,
  provider: any,
  setBalance: any,
  setIsConnected: any,
  isInitialised: boolean
) {
  return async () => {
    if (!signer) {
      console.log("[Hooks] No signer");
      return;
    }

    const SCWProvider: any = await localforage.getItem(
      generateSHA256Hash("smartAccountProvider")
    );
    const storageChainId: any = getItemFromStorage("network");

    if (
      isInitialised == false &&
      SCWProvider &&
      storageChainId &&
      storageChainId === chainId
    ) {
      const smartAccountAddress: any = getItemFromStorage("smartAccount");
      console.log("Im form the if statement ");
      console.log("isInitialised", isInitialised);

      setItemInStorage("network", chainId);
      setItemInStorage("isLoggedIn", true);
      setSmartAccountProvider(JSON.parse(SCWProvider));
      setSmartAccountAddress(smartAccountAddress);

      useGetBalance(provider, smartAccountAddress, setBalance);

      setIsConnected(true);

      return;
    }

    const bundler = new Bundler({
      bundlerUrl,
      chainId,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    });
    const paymaster = new BiconomyPaymaster({ paymasterUrl });

    const smartAccountConfig: any = {
      signer,
      chainId,
      rpcUrl,
      bundler,
      paymaster,
    };

    const account = new BiconomySmartAccount(smartAccountConfig);
    const smartAccount = await account.init();

    const smartAccountAddress = await smartAccount.getSmartAccountAddress();

    console.log("[Hooks] Smart Account Address: ", smartAccountAddress);

    login();
    setItemInStorage("smartAccount", smartAccountAddress);
    setItemInStorage("network", chainId);
    setItemInStorage("isLoggedIn", true);
    setSmartAccountProvider(smartAccount);
    setSmartAccountAddress(smartAccountAddress);

    await localforage.setItem(
      generateSHA256Hash("smartAccountProvider"),
      JSON.stringify(smartAccount)
    );
    await useGetBalance(provider, smartAccountAddress, setBalance);

    setIsConnected(true);
  };
}
