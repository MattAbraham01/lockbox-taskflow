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
    [deployer, user1] = await hre.ethers.getSigners();

    const FitnessTrackerFactory = await hre.ethers.getContractFactory(
      "EncryptedFitnessTracker"
    );
    fitnessTracker = await FitnessTrackerFactory.deploy();
    await fitnessTracker.waitForDeployment();
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

  it("Should support batch activity storage", async function () {
    const activityTypes = [0, 1, 2]; // Running, Cycling, Swimming
    const activityData = [30, 45, 20]; // Minutes for each activity
    const inputProofs = ["0x00", "0x00", "0x00"];

    await fitnessTracker.batchStoreActivities(activityTypes, activityData, inputProofs);

    // Verify all activities were stored
    expect(await fitnessTracker.getActivityData(deployer.address, 0)).to.equal(30); // Running
    expect(await fitnessTracker.getActivityData(deployer.address, 1)).to.equal(45); // Cycling
    expect(await fitnessTracker.getActivityData(deployer.address, 2)).to.equal(20); // Swimming

    // Verify total activities count
    expect(await fitnessTracker.getTotalActivities(deployer.address)).to.equal(3);
  });

  it("Should accumulate data in batch operations", async function () {
    // First batch
    await fitnessTracker.batchStoreActivities([0], [30], ["0x00"]); // 30 min running

    // Second batch with same activity type
    await fitnessTracker.batchStoreActivities([0], [45], ["0x00"]); // 45 more min running

    // Should accumulate: 30 + 45 = 75
    expect(await fitnessTracker.getActivityData(deployer.address, 0)).to.equal(75);
    expect(await fitnessTracker.getTotalActivities(deployer.address)).to.equal(2);
  });

  it("Should provide total activity data aggregation", async function () {
    await fitnessTracker.storeActivityData(0, 30, "0x00"); // Running: 30
    await fitnessTracker.storeActivityData(1, 45, "0x00"); // Cycling: 45
    await fitnessTracker.storeActivityData(2, 20, "0x00"); // Swimming: 20

    const [totalData, activityCount] = await fitnessTracker.getTotalActivityData(deployer.address);

    expect(totalData).to.equal(95); // 30 + 45 + 20
    expect(activityCount).to.equal(3); // 3 different activities
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

