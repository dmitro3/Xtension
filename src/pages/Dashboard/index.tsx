/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import send from "../../assets/arrow-up.png";
import receive from "../../assets/arrow-down.png";
import logoIcon from "../../assets/icons/icon16.png";
import { getItemFromStorage, getShortDisplayString } from "../../utils/helper";
import { useConfig } from "../../context/ConfigProvider";
import Chains from "../../constants/chains";

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string>("");
  const [currentCoinName, setCurrentCoinName] = useState<string>("");

  const item = getItemFromStorage("smartAccount");
  const chain = getItemFromStorage("network");

  const [SCW] = useState(item || null);
  const [chainId] = useState(chain || null);

  const { smartAccountAddress, provider, init } = useConfig();
  const navigate = useNavigate();

  const storageChainId = getItemFromStorage("network");

  useEffect(() => {
    async function initializeSmartWallet() {
      if (!smartAccountAddress) {
        init(chainId);
      } else {
        let balance = await provider.getBalance(SCW || smartAccountAddress);
        balance = ethers.utils.formatEther(balance);

        setBalance(balance);
      }
    }

    setSmartWalletAddress(SCW || smartAccountAddress);

    initializeSmartWallet();
  }, [smartAccountAddress, smartWalletAddress]);

  useEffect(() => {
    if (storageChainId) {
      const currentChain = Chains.filter((ch) => ch.chainId === storageChainId);
      setCurrentCoinName(currentChain?.[0]?.nativeAsset);
    } else {
      setCurrentCoinName(Chains?.[0]?.nativeAsset);
    }
  }, [storageChainId]);

  async function sendTx() {
    navigate(`/dashboard/transaction/add-address`);
  }

  return (
    <>
      <div className=" text-white mt-24 min-h-[210px]">
        <div className="flex justify-center mb-7">
          <img className="w-7 h-7 rounder mr-3" src={logoIcon} alt="address" />
          <h2 className="text-2xl font-bold">
            {getShortDisplayString(SCW || smartWalletAddress)}
          </h2>
        </div>
        <h3 className="text-center text-3xl font-extrabold">{balance} {currentCoinName}</h3>

        <div className="flex gap-5 justify-center item-center mt-5 text-center">
          <div
            className="flex flex-col justify-center item-center gap-2"
          >
            <img
              className="h-10 bg-white rounded-full p-1 shadow-lg border hover:bg-gray-100 hover:bg-opacity-90"
              src={receive}
              alt="receiveButton"
            />
            <h1 className="text-base font-medium">Recieve</h1>
          </div>
          <div className="flex flex-col justify-center item-center gap-2">
            <img
              onClick={() => sendTx()}
              className="h-10 bg-white rounded-full p-1 shadow-lg border hover:bg-gray-100 hover:bg-opacity-90"
              src={send}
              alt="sendButton"
            />
            <h1 className="text-base font-medium">Send</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
