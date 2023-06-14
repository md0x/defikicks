import RegistryAbi from "../contracts/DefiKicksAdapterRegistry.json"
import type { DefiKicksAdapterRegistry } from "../contracts/types/DefiKicksAdapterRegistry"
import useContract from "./useContract"
import addresses from "../addresses.json"

export default function useRegistry() {
    return useContract<DefiKicksAdapterRegistry>(addresses.registry, RegistryAbi)
}
