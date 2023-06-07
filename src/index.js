import { CeramicClient } from "@ceramicnetwork/http-client"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { joinSignature } from "@ethersproject/bytes"
import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs"
import { hash } from "@stablelib/sha256"
import { base64ToBytes, createJWS } from "did-jwt"
import { DID } from "dids"
import elliptic from "elliptic"
import * as ethers from "ethers"
import stringify from "fast-json-stable-stringify"
import fs from "fs"
import { getResolver } from "key-did-resolver"
import { RPCError, createHandler } from "rpc-utils"
import siwe from "siwe"
import * as u8a from "uint8arrays"
import { fromString as uint8arrayFromString } from "uint8arrays/from-string"
import { loadDocumentByController } from "./ceramic-utils.js"
const ec = new elliptic.ec("secp256k1")

function copy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

export function sha256(payload) {
    const data = typeof payload === "string" ? u8a.fromString(payload) : payload
    return hash(data)
}
export function bytesToBase64url(b) {
    return u8a.toString(b, "base64url")
}
export function encodeBase64url(s) {
    return bytesToBase64url(u8a.fromString(s))
}
export function bytesToHex(b) {
    return u8a.toString(b, "base16")
}
export function toStableObject(obj) {
    return JSON.parse(stringify(obj))
}
export function toGeneralJWS(jws) {
    const [protectedHeader, payload, signature] = jws.split(".")
    return {
        payload,
        signatures: [{ protected: protectedHeader, signature }],
    }
}
export function toJose({ r, s, recoveryParam }, recoverable) {
    const jose = new Uint8Array(recoverable ? 65 : 64)
    jose.set(u8a.fromString(r, "base16"), 0)
    jose.set(u8a.fromString(s, "base16"), 32)
    if (recoverable) {
        if (typeof recoveryParam === "undefined") {
            throw new Error("Signer did not return a recoveryParam")
        }
        jose[64] = recoveryParam
    }
    return bytesToBase64url(jose)
}
export function fromJose(signature) {
    const signatureBytes = base64ToBytes(signature)
    if (signatureBytes.length < 64 || signatureBytes.length > 65) {
        throw new TypeError(
            `Wrong size for signature. Expected 64 or 65 bytes, but got ${signatureBytes.length}`
        )
    }
    const r = bytesToHex(signatureBytes.slice(0, 32))
    const s = bytesToHex(signatureBytes.slice(32, 64))
    const recoveryParam = signatureBytes.length === 65 ? signatureBytes[64] : undefined
    return { r, s, recoveryParam }
}
export function instanceOfEcdsaSignature(object) {
    return typeof object === "object" && "r" in object && "s" in object
}
export function getInstanceType(value) {
    if (value instanceof Object) {
        if (value.constructor.name == "Object") {
            return "Object"
        }
        return value.constructor.name
    }
    return typeof value
}
export function log(name, value = null, printObj = false) {
    const PREFIX = "[key-did-provider-secp256k1]"
    const STYLE = "color: #5FA227"
    if (value !== null) {
        const instanceType = getInstanceType(value)
        let text
        try {
            text = JSON.stringify(value)
        } catch (e) {
            text = ""
        }
        if (printObj == false) {
            console.log(
                `%c${PREFIX}: ${name}${instanceType != null ? `(${instanceType})` : ""} "${text}"`,
                `${STYLE}`
            )
            return
        }
        console.log(
            `%c${PREFIX}: ${name}${instanceType != null ? `(${instanceType})` : ""}`,
            `${STYLE}`
        )
        console.log(value)
        return
    }
    console.log(`[key-did-provider-secp256k1]: ${name}$`)
}

export const getAuthSig = async () => {
    if (!process.env.PRIVATE_KEY) throw new Error("No private key found")
    const privKey = process.env.PRIVATE_KEY
    const privKeyBuffer = uint8arrayFromString(privKey, "base16")
    const wallet = new ethers.Wallet(privKeyBuffer)
    const domain = "localhost"
    const origin = "https://localhost/login"
    const statement = "This is a test statement.  You can put anything you want here."
    const siweMessage = new siwe.SiweMessage({
        domain,
        address: wallet.address,
        statement,
        uri: origin,
        version: "1",
        chainId: 1,
    })
    const messageToSign = siweMessage.prepareMessage()
    const signature = await wallet.signMessage(messageToSign)
    console.log("signature", signature)
    const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature)
    const authSig = {
        sig: signature,
        derivedVia: "web3.eth.personal.sign",
        signedMessage: messageToSign,
        address: recoveredAddress,
    }
    return authSig
}

export const litActionSignAndGetSignature = async (sha256Payload, context) => {
    log("[litActionSignAndGetSignature] sha256Payload: ", sha256Payload)
    const authSig = await getAuthSig()
    log("[litActionSignAndGetSignature] authSig:", authSig)
    const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
        litNetwork: "serrano",
    })
    await litNodeClient.connect()
    log("[litActionSignAndGetSignature] ipfsId:", context.ipfsId)
    const jsParams = {
        toSign: Array.from(sha256Payload),
        publicKey: decodeDIDWithLit(context.did),
        sigName: "sig1",
    }
    log("[litActionSignAndGetSignature] jsParams:", jsParams)
    const executeOptions = {
        ...((context.ipfsId === undefined || !context.ipfsId) && {
            code: context.litCode,
        }),
        ...((context.litCode === undefined || !context.litCode) && {
            ipfsId: context.ipfsId,
        }),
        authSig,
        jsParams,
    }
    const res = await litNodeClient.executeJs(executeOptions)
    log("[litActionSignAndGetSignature] res.signatures:", res.signatures)
    const signature = res.signatures
    return {
        r: signature.sig1.r,
        s: signature.sig1.s,
        recoveryParam: signature.sig1.recid,
    }
}
export async function encodeDIDWithLit(PKP_PUBLIC_KEY) {
    const pkpPubKey = PKP_PUBLIC_KEY.replace("0x", "")
    log("[encodeDIDWithLit] pkpPubKey:", pkpPubKey)
    const pubBytes = ec.keyFromPublic(pkpPubKey, "hex").getPublic(true, "array")
    log("[encodeDIDWithLit] pubBytes:", pubBytes)
    const bytes = new Uint8Array(pubBytes.length + 2)
    bytes[0] = 0xe7
    bytes[1] = 0x01
    bytes.set(pubBytes, 2)
    log("[encodeDIDWithLit] bytes:", bytes)
    const did = `did:key:z${u8a.toString(bytes, "base58btc")}`
    log(`[encodeDIDWithLit] did:`, did)
    return did
}
export function decodeDIDWithLit(encodedDID) {
    log("[decodeDIDWithLit] encodedDID:", encodedDID)
    const arr = encodedDID?.split(":")
    if (arr[0] != "did") throw Error("string should start with did:")
    if (arr[1] != "key") throw Error("string should start with did:key")
    if (arr[2].charAt(0) !== "z") throw Error("string should start with did:key:z")
    const str = arr[2].substring(1)
    log("[decodeDIDWithLit] str:", str)
    const bytes = u8a.fromString(str, "base58btc")
    const originalBytes = new Uint8Array(bytes.length - 2)
    bytes.forEach((_, i) => {
        originalBytes[i] = bytes[i + 2]
    })
    log("[decodeDIDWithLit] originalBytes:", originalBytes)
    const pubPoint = ec.keyFromPublic(originalBytes).getPublic()
    let pubKey = pubPoint.encode("hex", false)
    pubKey = pubKey.charAt(0) == "0" ? pubKey.substring(1) : pubKey
    log("[decodeDIDWithLit] pubKey:", pubKey)
    return "0x0" + pubKey
}
export function ES256KSignerWithLit(context) {
    log("[ES256KSignerWithLit]")
    const recoverable = false
    return async (payload) => {
        const encryptedPayload = sha256(payload)
        log("[ES256KSignerWithLit] encryptedPayload:", encryptedPayload)
        const signature = await litActionSignAndGetSignature(encryptedPayload, context)
        log("[ES256KSignerWithLit] signature:", signature)
        return toJose(signature, recoverable)
    }
}
const signWithLit = async (payload, context) => {
    const did = context.did
    log("[signWithLit] did:", did)
    const kid = `${did}#${did.split(":")[2]}`
    log("[signWithLit] kid:", kid)
    const protectedHeader = {}
    const header = toStableObject(Object.assign(protectedHeader, { kid, alg: "ES256K" }))
    log("[signWithLit] header:", header)
    log("[signWithLit] payload:", payload)
    return createJWS(
        typeof payload === "string" ? payload : toStableObject(payload),
        ES256KSignerWithLit(context),
        header
    )
}
const didMethodsWithLit = {
    did_authenticate: async (contextParam, params) => {
        const payload = {
            did: contextParam.did,
            aud: params.aud,
            nonce: params.nonce,
            paths: params.paths,
            exp: Math.floor(Date.now() / 1000) + 600,
        }
        log("[didMethodsWithLit] payload:", payload)
        const response = await signWithLit(payload, contextParam)
        log("[didMethodsWithLit] response:", response)
        const general = toGeneralJWS(response)
        log("[didMethodsWithLit] general:", general)
        return general
    },
    did_createJWS: async (contextParam, params) => {
        const requestDid = params.did.split("#")[0]
        if (requestDid !== contextParam.did)
            throw new RPCError(4100, `Unknown DID: ${contextParam.did}`)
        const jws = await signWithLit(params.payload, contextParam)
        log("[did_createJWS] jws:", jws)
        return { jws: toGeneralJWS(jws) }
    },
    did_decryptJWE: async () => {
        return { cleartext: "" }
    },
}
export class Secp256k1ProviderWithLit {
    constructor(context) {
        const handler = createHandler(didMethodsWithLit)
        this._handle = async (msg) => {
            log("[Secp256k1ProviderWithLit] this._handle(msg):", msg)
            const _handler = await handler(context, msg)
            return _handler
        }
    }
    get isDidProvider() {
        return true
    }
    async send(msg) {
        return await this._handle(msg)
    }
}
const PKP_PUBLIC_KEY =
    "0x04e9cf329c3a902299e0636e963f8d4ac7d681dfc7324be8cffe067cd7d0b7bdcf001ff2dda1e7a35c6bc7c28da389c636a0fe3aba179c79493732e987824e9222"
const authcode = `
const go = async () => {
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey , sigName });
};

go();
`

const litActionCode = fs.readFileSync("./src/bundled.js")

function sha256Hash(string) {
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(string))
    return hash
}

const run = async () => {
    const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
        litNetwork: "serrano",
    })
    await litNodeClient.connect()

    const authSig = await getAuthSig()

    const ceramic = new CeramicClient("https://ceramic-clay.3boxlabs.com")

    const documentRead = await loadDocumentByController(
        ceramic,
        "did:key:zQ3shd9UzmzoyUQMpJyewkxjcEPuy5BLixHRjhn9ycbHNHKBt",
        "test"
    )

    const test = sha256Hash("Hello World")

    const tes2 = ethers.utils.toUtf8Bytes(sha256Hash(JSON.stringify({ signed: "true" })))

    //   var loadDoc2 = await TileDocument.load(ceramic, docId);
    //   loadDoc2;

    const encodedDID = await encodeDIDWithLit(PKP_PUBLIC_KEY)

    const provider = new Secp256k1ProviderWithLit({
        did: encodedDID,
        litCode: authcode,
    })

    const did = new DID({ provider, resolver: getResolver() })
    await did.authenticate()
    ceramic.did = did

    const results = await litNodeClient.executeJs({
        code: litActionCode.toString(),
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
            // this is the string "Hello World" for testing
            publicKey: PKP_PUBLIC_KEY,
            sigName: "sig1",
        },
    })

    const signatures = results.signatures
    const sig = signatures.sig1
    const encodedSig = joinSignature({
        r: "0x" + sig.r,
        s: "0x" + sig.s,
        v: sig.recid,
    })

    console.log("encodedSig", encodedSig)

    const recoveredAddressViaMessage = ethers.utils.verifyMessage(
        results.response.response,
        encodedSig
    )
    const expected = ethers.utils.computeAddress(PKP_PUBLIC_KEY)
    console.log(
        "recoveredAddressViaMessage",
        recoveredAddressViaMessage,
        expected === recoveredAddressViaMessage
    )

    console.log("DID:", did)
    // 'did:key:zQ3shd9UzmzoyUQMpJyewkxjcEPuy5BLixHRjhn9ycbHNHKBt'

    const document = await loadDocumentByController(ceramic, ceramic.did.id.toString(), "test")

    const newContent = copy(document.content)

    newContent.dataPoints = [...(newContent.dataPoints ? copy(newContent.dataPoints) : [])]
    newContent.dataPoints.push({
        timestamp: Date.now(),
        value: 123,
    })

    console.log("newContent", JSON.stringify(newContent, null, 2))

    await document.update(newContent)

    console.log("OK")
    // const doc = await TileDocument.update(ceramic)
    // console.log("Doc/StreamID:", doc.id.toString())
    // var loadDoc = await TileDocument.load(ceramic, doc.id.toString())
    // console.log("Specific doc:", loadDoc.content)
}
run().catch(console.error)
console.log("test")
