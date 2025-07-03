import { createPublicClient, createWalletClient, http } from "viem";
import { filecoinCalibration } from "viem/chains";

export const walletClient = createWalletClient({
    chain: filecoinCalibration,
    transport: http(process.env.RPC_URL as string),
  });
  
  export const publicClient = createPublicClient({
    chain: filecoinCalibration,
    transport: http(process.env.RPC_URL as string),
  });    