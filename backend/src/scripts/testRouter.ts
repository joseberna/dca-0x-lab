import { ethers } from "ethers";
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/3285dd0e8fb346d08dea77b7b58e2990");
const router = new ethers.Contract("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", ["function exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) payable returns (uint256)"], provider);
console.log(await router.interface.getFunction("exactInputSingle"));
