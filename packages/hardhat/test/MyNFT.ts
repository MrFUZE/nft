import { expect } from "chai";
import { ethers } from "hardhat";
import { MyNFT } from "../typechain-types";

describe("MyNFT", function () {
  let myNFT: MyNFT;
  let owner: any;
  let addr1: any;
  
  // Тестовые данные
  const testName = "Test NFT";
  const testDescription = "Test Description";
  const testImageUrl = "https://i.imgur.com/xi6JBmS.jpeg";

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners();
    const MyNFTFactory = await ethers.getContractFactory("MyNFT");
    myNFT = (await MyNFTFactory.deploy(owner.address)) as MyNFT;
    await myNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Должен установить правильного владельца", async function () {
      expect(await myNFT.owner()).to.equal(owner.address);
    });

    it("Должен иметь правильное имя и символ", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });
  });

  describe("Минтинг", function () {
    it("Владелец может минтить NFT", async function () {
      await expect(myNFT.safeMint(addr1.address, testName, testDescription, testImageUrl))
        .to.emit(myNFT, "TokenMinted")
        .withArgs(0, addr1.address, testName, testDescription, testImageUrl);
      
      expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
    });

    it("Не владелец не может минтить NFT", async function () {
      await expect(
        myNFT.connect(addr1).safeMint(addr1.address, testName, testDescription, testImageUrl)
      ).to.be.revertedWithCustomError(myNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("Получение данных токенов", function () {
    beforeEach(async () => {
      await myNFT.safeMint(addr1.address, testName, testDescription, testImageUrl);
    });

    it("Должен правильно возвращать все токены", async function () {
      const tokens = await myNFT.getAllTokens();
      expect(tokens.length).to.equal(1);
      expect(tokens[0].name).to.equal(testName);
      expect(tokens[0].description).to.equal(testDescription);
      expect(tokens[0].imageUrl).to.equal(testImageUrl);
      expect(tokens[0].owner).to.equal(addr1.address);
    });

    it("Должен правильно отслеживать баланс по��ьзователя", async function () {
      expect(await myNFT.balanceOf(addr1.address)).to.equal(1);
    });
  });
}); 