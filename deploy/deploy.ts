import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy EncryptedFitnessTracker
  const deployedFitnessTracker = await deploy("EncryptedFitnessTracker", {
    from: deployer,
    log: true,
  });
  console.log(`EncryptedFitnessTracker contract: `, deployedFitnessTracker.address);
};
export default func;
func.id = "deploy_contracts"; // id required to prevent reexecution
func.tags = ["EncryptedFitnessTracker"];

