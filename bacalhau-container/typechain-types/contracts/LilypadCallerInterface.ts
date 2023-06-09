/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface LilypadCallerInterfaceInterface extends utils.Interface {
  functions: {
    "lilypadCancelled(address,uint256,string)": FunctionFragment;
    "lilypadFulfilled(address,uint256,uint8,string)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "lilypadCancelled" | "lilypadFulfilled"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "lilypadCancelled",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "lilypadFulfilled",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "lilypadCancelled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lilypadFulfilled",
    data: BytesLike
  ): Result;

  events: {};
}

export interface LilypadCallerInterface extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LilypadCallerInterfaceInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    lilypadCancelled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _errorMsg: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    lilypadFulfilled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _resultType: PromiseOrValue<BigNumberish>,
      _result: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  lilypadCancelled(
    _from: PromiseOrValue<string>,
    _jobId: PromiseOrValue<BigNumberish>,
    _errorMsg: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  lilypadFulfilled(
    _from: PromiseOrValue<string>,
    _jobId: PromiseOrValue<BigNumberish>,
    _resultType: PromiseOrValue<BigNumberish>,
    _result: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    lilypadCancelled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _errorMsg: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    lilypadFulfilled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _resultType: PromiseOrValue<BigNumberish>,
      _result: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    lilypadCancelled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _errorMsg: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    lilypadFulfilled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _resultType: PromiseOrValue<BigNumberish>,
      _result: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    lilypadCancelled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _errorMsg: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    lilypadFulfilled(
      _from: PromiseOrValue<string>,
      _jobId: PromiseOrValue<BigNumberish>,
      _resultType: PromiseOrValue<BigNumberish>,
      _result: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
