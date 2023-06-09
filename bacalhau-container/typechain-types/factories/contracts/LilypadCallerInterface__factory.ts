/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  LilypadCallerInterface,
  LilypadCallerInterfaceInterface,
} from "../../contracts/LilypadCallerInterface";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_jobId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_errorMsg",
        type: "string",
      },
    ],
    name: "lilypadCancelled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_from",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_jobId",
        type: "uint256",
      },
      {
        internalType: "enum LilypadResultType",
        name: "_resultType",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "_result",
        type: "string",
      },
    ],
    name: "lilypadFulfilled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class LilypadCallerInterface__factory {
  static readonly abi = _abi;
  static createInterface(): LilypadCallerInterfaceInterface {
    return new utils.Interface(_abi) as LilypadCallerInterfaceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LilypadCallerInterface {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as LilypadCallerInterface;
  }
}
