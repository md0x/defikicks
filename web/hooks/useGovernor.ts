import GovernorAbi from "../contracts/GovernorContract.json"
import type { GovernorContract } from "../contracts/types/GovernorContract"
import useContract from "./useContract"
import addresses from "../addresses.json"

export default function useGovernor() {
    return useContract<GovernorContract>(addresses.governor, GovernorAbi)
}
