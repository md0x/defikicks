function sha256Hash(string) {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(string))
    return hash
}

const downloadIpfsFile = async (ipfsHash) => {
    const url = "https://ipfs.io/ipfs/" + ipfsHash
    return await fetch(url).then((response) => response.text())
}

const code = `
  // JavaScript code to be executed
  function getEthAddress() {
    return ethers.utils.computeAddress(publicKey)
  }

  getEthAddress();
`

const go = async () => {
    let ethAddress = ethers.utils.computeAddress(publicKey)

    const code = await downloadIpfsFile("QmSsJnVZ5oVPaf3uZ3S3WnjSYjrtQdpMkSiMsim1eCqE6C")

    const response = eval(code)

    const responseHash = ethers.utils.toUtf8String(
        ethers.utils.toUtf8Bytes(sha256Hash(JSON.stringify(response)))
    )

    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({
        message: responseHash,
        publicKey,
        sigName,
    })

    Lit.Actions.setResponse({
        response: JSON.stringify({ ethAddress, response, responseHash }),
    })
}

go()
