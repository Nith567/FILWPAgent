import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, parseEther } from 'viem';
import { FilFedContract } from "@/contract/abi";

const USDFC_TOKEN_ADDRESS = "0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0";

export const useContract = (contractAddress: string, amount: string) => {
  const [approvalTx, setApprovalTx] = useState<string>();
  const [purchaseTx, setPurchaseTx] = useState<string>();
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync: approveAsync, isPending: isApprovePending } = useWriteContract();
  const { writeContractAsync: purchaseAsync, isPending: isPurchasePending } = useWriteContract();

  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalTx as `0x${string}`,
    query: { enabled: !!approvalTx },
  });

  const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseConfirmed } = useWaitForTransactionReceipt({
    hash: purchaseTx as `0x${string}`,
    query: { enabled: !!purchaseTx },
  });

  // Step 1: Approve USDFC
  const claimAccessContent = async (userAccount: string) => {
    setError(null);
    setApprovalTx(undefined);
    setPurchaseTx(undefined);
    try {
      const txHash = await approveAsync({
        address: USDFC_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress as `0x${string}`, parseEther(amount) as bigint],
        account: userAccount as `0x${string}`,
      });
      setApprovalTx(txHash);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Approval failed");
    }
  };

  // Step 2: Wait for approval and trigger purchase
  useEffect(() => {
    const triggerPurchase = async () => {
      try {
        const txHash = await purchaseAsync({
          address: contractAddress as `0x${string}`,
          abi: FilFedContract.abi,
          functionName: "purchaseAccess",
          args: [],
        });
        setPurchaseTx(txHash);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Purchase failed");
      }
    };

    if (isApprovalConfirmed && !purchaseTx && !isPurchasePending) {
      triggerPurchase();
    }
  }, [isApprovalConfirmed, purchaseTx, isPurchasePending, contractAddress, purchaseAsync]);

  return {
    claimAccessContent,
    approvalTx,
    purchaseTx,
    isApprovePending,
    isApprovalConfirming,
    isApprovalConfirmed,
    isPurchasePending,
    isPurchaseConfirming,
    isPurchaseConfirmed,
    error,
  };
};
