import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/system-hooks/useAuth";
import Modal from "../../components/common/Modal";

import { useConfig } from "../../context/ConfigProvider";
import notificationIcon from "../../../src/assets/notifications.svg";

import {
  generateAddressIcon,
  getItemFromStorage,
  getShortDisplayString,
  removeItemFromStorage,
  setItemInStorage,
} from "../../utils/helper";
import Chains from "../../constants/chains";
import { ChevronDown, Plus } from "react-feather";
import toast from "react-hot-toast";
import ChainSelectionDrawer from "../../components/ChainSelectionDrawer";

export default function Header() {
  const [toggle, setToggle] = useState(false);
  const [openAccountModal, setOpenAccountModal] = useState<boolean>(false);
  const [defaultChainId] = useState<number>(80001);
  const [currentChainLogo, setCurrentChainLogo] = useState<string>("");
  const [currentCoinName, setCurrentCoinName] = useState<string>("");
  const [isChainSelectionDrawerOpen, setIsChainSelectionDrawerOpen] =
    useState<boolean>(false);

  const [smartWalletAddress, setSmartWalletAddress] = useState<string>("");

  const item = getItemFromStorage("smartAccount");
  const storageChainId = getItemFromStorage("network");
  const [SCW] = useState(item || null);
  const [chainId, setChainId] = useState(storageChainId);

  const {
    smartAccountAddress,
    init,
    EOA,
    balance: { SCW: SCWBalance, EOA: EOABalance },
  } = useConfig();

  const openChainSelectionDrawer = () => {
    setIsChainSelectionDrawerOpen(!isChainSelectionDrawerOpen);
  };

  const closeChainSelectionDrawer = () => {
    setIsChainSelectionDrawerOpen(false);
  };

  useEffect(() => {
    if (storageChainId) {
      const currentChain = Chains.filter((ch) => ch.chainId === storageChainId);
      setCurrentChainLogo(currentChain?.[0]?.chainUri);
      setCurrentCoinName(currentChain?.[0]?.nativeAsset);
    } else {
      setCurrentChainLogo(Chains[0]?.chainUri);
      setCurrentCoinName(Chains?.[0]?.nativeAsset);
    }
  }, [storageChainId]);

  useEffect(() => {
    async function initializeSmartWallet() {
      if (!smartAccountAddress) {
        init(chainId || defaultChainId);
      }
    }

    setSmartWalletAddress(SCW || smartAccountAddress);

    initializeSmartWallet();
  }, [smartAccountAddress, smartWalletAddress]);

  const handleNetworkSwitch = (
    chainId: number,
    chainUri: string,
    nativeAsset: string
  ) => {
    setCurrentChainLogo(chainUri);
    setChainId(chainId);
    setCurrentCoinName(nativeAsset);
    init(chainId);
    setItemInStorage("network", chainId);
  };

  const navigate = useNavigate();
  const { logout } = useAuth();

  const showNav = (key?: string) => {
    if (key === "/logout") {
      logout();
      setItemInStorage("isLoggedIn", false);
      removeItemFromStorage("smartAccount");

      navigate("/login");
    }
    setToggle(!toggle);
  };

  // start mobile first plus facile
  return (
    <>
      <nav className="text-white fixed top-0 w-full p-2  bg-[#1f1f20]">
        <div className="flex justify-between items-center w-full py-2 px-1">
          {/* Network secection  */}
          <div
            className="flex align-center justify-center  cursor-pointer  hover:opacity-70 bg-black  border rounded-lg py-1 pl-2 pr-1 "
            onClick={() => {
              openChainSelectionDrawer();
            }}
          >
            <img
              className="h-5 m-auto rounded-full"
              src={currentChainLogo}
              alt={`${currentCoinName} logo`}
            />
            <ChevronDown className="ml-2" />
          </div>

          {/* Account Type Selection  */}
          <div
            className=" justify-center text-base font-bold flex items-center cursor-pointer border rounded-lg bg-gray-800 border-gray-200 pl-2  h-8 text-gray-200"
            onClick={() => {
              setOpenAccountModal(true);
            }}
          >
            Smart Wallet
            <ChevronDown className="mx-1" />
          </div>

          {/* Notifications  */}
          <div
            className="justify-end"
            onClick={() => {
              toast("Coming Soon", {
                icon: "🔥",
              });
            }}
          >
            <img
              className="h-7"
              src={notificationIcon}
              alt="notification icon"
            />
          </div>

          <>
            {/* CURRENTLY NOT IN USE FUNCTIONS AND FEATURES  */}

            {/* User & quick settings  */}
            {/* <div className=" border rounded-lg ">
                <img
                  className="h-8"
                  src={generateAddressIcon(smartAccountAddress)}
                  alt="profile icon"
                />
              </div> */}

            {/* <button
                className="flex justify-end  hover:opacity-70"
                onClick={() => showNav()}
              >
                <img className="w-6" src={menuIcon} alt="X" />
              </button>
              <ul
                className={`${
                  toggle
                    ? "fixed flex flex-col top-[61px] right-0 text-white bg-gray-700 rounded-md"
                    : " hidden"
                }  `}
              >
                {toggle &&
                  navbarData.map((link, index) => {
                    return (
                      <li
                        key={index}
                        className={`relative flex flex-row items-center h-9 focus:outline-none  border-l-4 border-transparent pr-6 ${link.cname}`}
                      >
                        <Link
                          className="inline-flex justify-center items-center ml-4"
                          to={link.href}
                          onClick={() => showNav(link.href)}
                        >
                          {link.title}
                        </Link>
                      </li>
                    );
                  })}
              </ul> */}
          </>
        </div>
        {/* This is for  account Selection  */}
        <Modal
          isOpen={openAccountModal}
          onClose={() => {
            setOpenAccountModal(false);
          }}
          headerText="Select an Account"
        >
          <div className="flex flex-col gap-2 ">
            <div
              className="flex items-center space-x-4 py-2 px-2 bg-gray-800 border rounded-lg border-gray-200 my-2 cursor-pointer"
              onClick={() => {
                setOpenAccountModal(false);
              }}
            >
              <div className="border rounded-lg ">
                <img
                  className="w-8 h-8 rounded-full"
                  src={generateAddressIcon(SCW)}
                  alt="Wallet x"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate dark:text-white">
                  Smart Account
                </p>
                <p className="text-sm truncate dark:text-gray-400">
                  {getShortDisplayString(SCW || smartWalletAddress)}
                </p>
              </div>
              <div className="flex flex-col text-right text-md">
                <div className="inline-flex items-center text-base font-semibold dark:text-white">
                  {SCWBalance && Number(SCWBalance).toFixed(2).toString()}{" "}
                  {currentCoinName}
                </div>
              </div>
            </div>

            <div
              className="flex items-center space-x-4 py-2 px-2 bg-gray-800 border rounded-lg border-gray-200 my-2 cursor-pointer"
              onClick={() => {
                setOpenAccountModal(false);
              }}
            >
              <div className="border rounded-lg">
                <img
                  className="w-8 h-8 rounded-full"
                  src={generateAddressIcon(EOA)}
                  alt="Wallet x"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium truncate dark:text-white">
                  EOA
                </p>
                <p className="text-sm truncate dark:text-gray-400">
                  {EOA && getShortDisplayString(EOA)}
                </p>
              </div>
              <div className="flex flex-col text-right text-md">
                <div className="inline-flex items-center text-base font-semibold dark:text-white">
                  {EOABalance && Number(EOABalance).toFixed(2).toString()}{" "}
                  {currentCoinName}
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <>
          {/* This is for the network Selecton  */}
          {/* <Modal
        isOpen={openNetworkModal}
        onClose={() => {
          setOpenNetworkModal(false);
        }}
        headerText="Select an Network"
      >
        <div
          className="py-3 px-3 sm:py-4 cursor-pointer max-h-60 overflow-auto"
          onClick={() => {
            setOpenNetworkModal(false);
          }}
        >
          {Chains.map((chain) => {
            return !chain.isEnabled ? null : (
              <button
                className={`flex items-center space-x-4 ${
                  chain.chainId === storageChainId
                    ? "border-l-4 rounded border-gray-400"
                    : ""
                }`}
                style={{
                  width: "100%",
                  paddingTop: "7px",
                  marginBottom: "5px",
                  marginTop: "5px",
                  paddingBottom: "7px",
                  textAlign: "left",
                  boxShadow: "2px 0px 1px 1px rgba(0, 0, 0, 0.1)",
                }}
                onClick={() =>
                  handleNetworkSwitch(
                    chain.chainId,
                    chain.chainUri,
                    chain.nativeAsset
                  )
                }
              >
                <div className={`flex items-center space-x-4`}>
                  <div className="flex-shrink-0 ml-2">
                    <img
                      className="w-7 h-7 rounded-full"
                      src={chain.chainUri}
                      alt="ETH"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate dark:text-white">
                      {chain.name}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          className="text-white bg-gray-900 border hover:bg-gray-950 rounded-3xl flex justify-center m-auto
        transition duration-500 hover:scale-110 mt-10"
          onClick={() => {
            setOpenNetworkModal(true);
          }}
        >
          <div className="p-2 flex justify-between items-center gap-5 font-bold">
            <Plus /> Add Network
          </div>
        </Button>
      </Modal> */}
        </>
      </nav>
      <ChainSelectionDrawer
        isOpen={isChainSelectionDrawerOpen}
        onSelectedClose={closeChainSelectionDrawer}
      />
    </>
  );
}
