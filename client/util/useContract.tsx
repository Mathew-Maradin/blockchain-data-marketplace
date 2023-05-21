import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import ABIObject from "../contract.json";

export const useContract = () => {
  const CONTRACT_ADDY = "0xCD02ea426917F4e6A888702D69357E9ecCc55811";
  const web3 = createAlchemyWeb3(process.env.NEXT_PUBLIC_ALCHEMY_URL as string);
  const contract = new web3.eth.Contract(ABIObject.abi, CONTRACT_ADDY);

  return { contract, address: CONTRACT_ADDY };
};
