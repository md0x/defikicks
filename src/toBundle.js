// no need to import ethers, it's automatically injected on the lit node side
// import { ethers } from 'ethers';

// import { SiweMessage } from "siwe";

// import { CeramicClient } from "@ceramicnetwork/http-client";
// import { TileDocument } from "@ceramicnetwork/stream-tile";

// const domain = "localhost:3000";
// const origin = "http://localhost:3000";

// function createSiweMessage(address, statement) {
//   const message = new SiweMessage({
//     domain,
//     address,
//     statement,
//     uri: origin,
//     version: "1",
//     chainId: "1",
//     nonce, // provided as a jsParam global
//     issuedAt, // provided as a jsParam global
//   });
//   return message.prepareMessage();
// }

function sha256Hash(string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(string));
  return hash;
}

const go = async () => {
  let ethAddress = ethers.utils.computeAddress(publicKey);

  const response = JSON.stringify({ signed: "true" });

  const message = ethers.utils.toUtf8Bytes(sha256Hash(response));

  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
    message: response,
    publicKey,
    sigName,
  });

  Lit.Actions.setResponse({
    response: JSON.stringify({ ethAddress, response }),
  });
};

go();
