"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import Image from "next/image";

export function ConnectWalletButton() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="flex items-center justify-between p-4 border-b dark:border-gray-800"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <Image src="/filecoin.png" alt="Filecoin" width={30} height={30} />
          <h1 className="text-xl font-bold mr-4">FILWPAgent</h1>
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-4 ml-8"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4">
          <ConnectButton />
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}
