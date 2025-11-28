import { expect } from "chai";
import { ethers } from "ethers";
import hre from "hardhat";

describe("EncryptedFitnessTracker", function () {
  let fitnessTracker: any;
  let deployer: any;
  let user1: any;

  beforeEach(async function () {
    [deployer, user1] = await hre.ethers.getSigners();

    const FitnessTrackerFactory = await hre.ethers.getContractFactory(
      "EncryptedFitnessTracker"
    );
    fitnessTracker = await FitnessTrackerFactory.deploy();
    await fitnessTracker.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await fitnessTracker.getAddress()).to.be.properAddress;
  });

  it("Should store activity data", async function () {
    const activityData = 30; // 30 minutes
    await fitnessTracker.storeActivityData(0, activityData, "0x00"); // Running = 0

    const storedData = await fitnessTracker.getActivityData(deployer.address, 0);
    expect(storedData).to.equal(activityData);
  });

  it("Should accumulate activity data", async function () {
    await fitnessTracker.storeActivityData(0, 30, "0x00"); // 30 minutes running
    await fitnessTracker.storeActivityData(0, 45, "0x00"); // 45 more minutes running

    const totalData = await fitnessTracker.getActivityData(deployer.address, 0);
    expect(totalData).to.equal(75); // 30 + 45 = 75 minutes
  });

  it("Should increment total activities count", async function () {
    await fitnessTracker.storeActivityData(0, 30, "0x00"); // Running
    await fitnessTracker.storeActivityData(1, 45, "0x00"); // Cycling

    const totalActivities = await fitnessTracker.getTotalActivities(deployer.address);
    expect(totalActivities).to.equal(2);
  });

  it("Should return zero for uninitialized activity", async function () {
    const storedData = await fitnessTracker.getActivityData(user1.address, 0);
    expect(storedData).to.equal(0);
  });

  it("Should update last update time", async function () {
    await fitnessTracker.storeActivityData(0, 30, "0x00");

    const lastUpdate = await fitnessTracker.getLastUpdateTime(deployer.address);
    expect(lastUpdate).to.be.gt(0);
  });

  it("Should track different activity types separately", async function () {
    await fitnessTracker.storeActivityData(0, 30, "0x00"); // Running: 30 min
    await fitnessTracker.storeActivityData(1, 45, "0x00"); // Cycling: 45 min

    const runningData = await fitnessTracker.getActivityData(deployer.address, 0);
    const cyclingData = await fitnessTracker.getActivityData(deployer.address, 1);

    expect(runningData).to.equal(30);
    expect(cyclingData).to.equal(45);
  });
});

