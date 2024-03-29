import { useEffect, useState, useRef } from "react";
import { useRecoilState } from "recoil";
import { transferState } from "../../src/state/TransferState";
import { Search } from "react-feather";
import Tokens from "../constants/tokens";
import { useConfig } from "../context/ConfigProvider";
import { getItemFromStorage } from "../utils/helper";
import localforage from "localforage";
import { generateSHA256Hash } from "../utils/helper";
import TokenCardTransaction from "./TokenCardTransaction";

type searchTokenPara = {
  isOpen: boolean;
  onClose: Function;
  uid: string;
};

type Token = [
  name: string,
  symbol: string,
  address: string,
  decimals: number | string,
  logoUri: string,
  balance: number | undefined
];

type tokenDataT = {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenLogoUrl: string;
  tokenDecimal: number;
};

const SearchToken = ({ isOpen, onClose, uid }: searchTokenPara) => {
  const { chainId } = useConfig();

  const [transferData, setTransferData] = useRecoilState(transferState);

  const [selectedToken, setSelectedToken] = useState<Token>();
  const [tokenIsSelected, setTokenIsSelected] = useState<boolean>(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(); // can also use token id for this
  const [balanceOfToken, setBalanceOfToken] = useState<number>(); // use it in handelAddButton
  const [tokenListFromIndexedDB, setTokenListFromIndexedDB] = useState<any>([]);
  const drawer = useRef(null);

  const { smartAccountAddress } = useConfig();
  const SCW = getItemFromStorage("smartAccount");

  const addToken = ([
    _tokenName,
    _tokenSymbol,
    _tokenAddress,
    _tokenDecimal,
    _tokenLogoUri,
    _tokenBalance,
  ]: Token) => {
    const tokenName = _tokenName;
    const tokenSymbol = _tokenSymbol;
    const tokenAddress = _tokenAddress;
    const tokenDecimal = _tokenDecimal;
    const tokenLogo = _tokenLogoUri;
    const tokenBalance = _tokenBalance;

    setTransferData((prevData) =>
      prevData.map((transferDetails) =>
        transferDetails.uid === uid
          ? {
              ...transferDetails,
              tokenName,
              tokenSymbol,
              tokenAddress,
              tokenDecimal,
              tokenLogo,
              tokenBalance,
            }
          : transferDetails
      )
    );
    setTokenIsSelected(false);
    onClose();
  };

  // function to fetch the data form Indexed DB using localFORage
  const getTokenDataForKey = async (key: string) => {
    try {
      const data = await localforage.getItem(
        generateSHA256Hash(key.toString())
      );
      setTokenListFromIndexedDB(data);
      return data || [];
    } catch (error) {
      console.error("Error getting token data:", error);
      return [];
    }
  };

  useEffect(() => {
    async function fetchData() {
      const retrievedData = await getTokenDataForKey(chainId); // put chainID
      setTokenListFromIndexedDB(retrievedData);
    }
    if (!tokenListFromIndexedDB.length) fetchData();
  }, [chainId]);

  useEffect(() => {
    const closeDrawerOnOutsideClick = (e: any) => {
      if (!(drawer.current as any).contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", closeDrawerOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeDrawerOnOutsideClick);
    };
  });

  return (
    <div
    ref={drawer}
      className={`${
        isOpen ? "bottom-0" : " translate-y-full"
      }  fixed bottom-0 left-1/2 translate-x-[-50%]  w-[350px] h-[455px] bg-slate-900 border-gray-300 text-white border rounded-t-3xl rounded-b-lg mt-10 px-4 py-5 transition duration-500  transform z-50 `}
    >
      <h1
        onClick={() => onClose()}
        className="text-center font-semibold text-xl"
      >
        Select Token
      </h1>

      {/* SEARCH BOX  */}
      <div className="flex items-center max-w-[95%] mx-auto border border-gray-300 rounded-lg my-4 p-2">
        <button className="min-w-fit  pr-1 opacity-60">
          <Search className="h-5 mx-auto my-auto" />
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="w-full focus:outline-none pl-1 bg-transparent"
          value=""
          //   onChange={handleInputChange}
          //   onFocus={handleFocus}
        />
      </div>

      {/* TOKEN CARD  */}

      <div className="overflow-y-scroll  max-h-[315px]">
        {Tokens[chainId].map((token, index) => {
          return (
            <>
              <TokenCardTransaction
                tokenIcon={token.logoUri}
                tokenName={token.name}
                tokenSymbol={token.symbol}
                tokenAddress={token.address}
                tokenDecimal={token?.decimals}
                userAddress={SCW || smartAccountAddress}
                isSelected={selectedTokenIndex === index}
                index={index}
                clickedTokenData={addToken}
              />
            </>
          );
        })}
        {tokenListFromIndexedDB &&
          tokenListFromIndexedDB.map((tokens: tokenDataT, index: any) => {
            return (
              <>
                <TokenCardTransaction
                  tokenIcon={tokens.tokenLogoUrl}
                  tokenName={tokens.tokenName}
                  tokenSymbol={tokens.tokenSymbol}
                  tokenAddress={tokens.tokenAddress}
                  tokenDecimal={tokens?.tokenDecimal}
                  userAddress={SCW || smartAccountAddress}
                  isSelected={selectedTokenIndex == index}
                  index={index}
                  clickedTokenData={addToken}
                />
              </>
            );
          })}
      </div>
    </div>
  );
};

export default SearchToken;
