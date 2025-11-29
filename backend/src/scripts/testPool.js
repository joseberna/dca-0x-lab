import { ethers } from "ethers";
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/3285dd0e8fb346d08dea77b7b58e2990");
const wallet = new ethers.Wallet("0xa5704d8fd04d18a7f7a23ebf55dbc1191fb9581a882c14b0aef4aa866e9c94ca", provider);
const usdc = new ethers.Contract("0x1C7D4b196Cb0C7B01D743Fbc6116A902379C7238", ["function balanceOf(address) view returns (uint256)"], provider);
const weth = new ethers.Contract("0x5300000000000000000000000000000000000004", ["function balanceOf(address) view returns (uint256)"], provider);
console.log("USDC:", (await usdc.balanceOf(wallet.address)).toString());
console.log("WETH:", (await weth.balanceOf(wallet.address)).toString());
