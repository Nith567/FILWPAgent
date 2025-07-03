import { FilFedContract } from "../contract/abi";
import { publicClient } from "../lib/client";
import { Account } from "viem";
import { walletClient } from "../lib/client";

export async function deployContract( cid:string,amount:string,account:Account) {
    
 const hash = await walletClient.deployContract({
    abi: FilFedContract.abi,
    account: account,
    args: [cid,amount],
    bytecode: FilFedContract.bytecode as `0x{string}`,
  });
  const tnx = await publicClient.waitForTransactionReceipt({ hash });
  console.log("gas used", tnx.gasUsed);
  console.log("hash : ", tnx, tnx.contractAddress);

    console.log("Deploying contract...", cid,amount);
    return tnx.contractAddress;
}
