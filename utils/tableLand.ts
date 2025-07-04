import { Database } from "@tableland/sdk";
import { Wallet, JsonRpcProvider } from "ethers";


const provider = new JsonRpcProvider(process.env.RPC_URL as string);
const wallet = new Wallet(process.env.PRIVATE_KEY as string, provider);

const db = new Database({ signer: wallet });
const tableName = "FILWPAGENT_314159_896";

export interface FilwpAgentRow {
  summary: string;
  tags: string; // JSON string
  hash: string;
  download: string;
  title: string;
  wallet_address: string;
  amount: string;
  contractAddress: string;
  timestamp: string;
}

export async function insertData(data: FilwpAgentRow) {
  const stmt = db.prepare(
    `INSERT INTO ${tableName} (summary, tags, hash, download, title, wallet_address, amount, contractAddress, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
  );
  const { meta: insert } = await stmt
    .bind(
      data.summary,
      data.tags,
      data.hash,
      data.download,
      data.title,
      data.wallet_address,
      data.amount,
      data.contractAddress,
      data.timestamp
    )
    .run();

  const tx= await insert.txn?.wait();
  return tx; 
}

export { db, tableName };