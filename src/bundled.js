"use strict";

// src/toBundle.js
function sha256Hash(string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(string));
  return hash;
}
var go = async () => {
  let ethAddress = ethers.utils.computeAddress(publicKey);
  const response = JSON.stringify({ signed: "true" });
  const message = ethers.utils.toUtf8Bytes(sha256Hash(response));
  const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
    message: response,
    publicKey,
    sigName
  });
  Lit.Actions.setResponse({
    response: JSON.stringify({ ethAddress, response })
  });
};
go();
