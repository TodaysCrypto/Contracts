const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ZERO_ADDRESS } = constants;

const { shouldBehaveLikeERC20 } = require("./ERC20.behavior.js");

const TCGToken = artifacts.require("TCGToken");

contract("TCGToken", function (accounts) {
  const [initialHolder, recipient, anotherAccount] = accounts;

  const name = "TodaysCrypto";
  const symbol = "TCG";

  const initialSupply = new BN("5000000000000000000000000000");

  beforeEach(async function () {
    this.token = await TCGToken.new(initialHolder);
  });

  it("has a name", async function () {
    expect(await this.token.name()).to.equal(name);
  });

  it("has a symbol", async function () {
    expect(await this.token.symbol()).to.equal(symbol);
  });

  it("has 18 decimals", async function () {
    expect(await this.token.decimals()).to.be.bignumber.equal("18");
  });

  shouldBehaveLikeERC20(
    "ERC20",
    initialSupply,
    initialHolder,
    recipient,
    anotherAccount
  );

  describe("decrease allowance", function () {
    describe("when the spender is not the zero address", function () {
      const spender = recipient;

      function shouldDecreaseApproval(amount) {
        describe("when there was no approved amount before", function () {
          it("reverts", async function () {
            await expectRevert(
              this.token.decreaseAllowance(spender, amount, {
                from: initialHolder,
              }),
              "ERC20: decreased allowance below zero"
            );
          });
        });

        describe("when the spender had an approved amount", function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            await this.token.approve(spender, approvedAmount, {
              from: initialHolder,
            });
          });

          it("emits an approval event", async function () {
            expectEvent(
              await this.token.decreaseAllowance(spender, approvedAmount, {
                from: initialHolder,
              }),
              "Approval",
              { owner: initialHolder, spender: spender, value: new BN(0) }
            );
          });

          it("decreases the spender allowance subtracting the requested amount", async function () {
            await this.token.decreaseAllowance(
              spender,
              approvedAmount.subn(1),
              { from: initialHolder }
            );

            expect(
              await this.token.allowance(initialHolder, spender)
            ).to.be.bignumber.equal("1");
          });

          it("sets the allowance to zero when all allowance is removed", async function () {
            await this.token.decreaseAllowance(spender, approvedAmount, {
              from: initialHolder,
            });
            expect(
              await this.token.allowance(initialHolder, spender)
            ).to.be.bignumber.equal("0");
          });

          it("reverts when more than the full allowance is removed", async function () {
            await expectRevert(
              this.token.decreaseAllowance(spender, approvedAmount.addn(1), {
                from: initialHolder,
              }),
              "ERC20: decreased allowance below zero"
            );
          });
        });
      }

      describe("when the sender has enough balance", function () {
        const amount = initialSupply;

        shouldDecreaseApproval(amount);
      });

      describe("when the sender does not have enough balance", function () {
        const amount = initialSupply.addn(1);

        shouldDecreaseApproval(amount);
      });
    });

    describe("when the spender is the zero address", function () {
      const amount = initialSupply;
      const spender = ZERO_ADDRESS;

      it("reverts", async function () {
        await expectRevert(
          this.token.decreaseAllowance(spender, amount, {
            from: initialHolder,
          }),
          "ERC20: decreased allowance below zero"
        );
      });
    });
  });

  describe("increase allowance", function () {
    const amount = initialSupply;

    describe("when the spender is not the zero address", function () {
      const spender = recipient;

      describe("when the sender has enough balance", function () {
        it("emits an approval event", async function () {
          expectEvent(
            await this.token.increaseAllowance(spender, amount, {
              from: initialHolder,
            }),
            "Approval",
            { owner: initialHolder, spender: spender, value: amount }
          );
        });

        describe("when there was no approved amount before", function () {
          it("approves the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, {
              from: initialHolder,
            });

            expect(
              await this.token.allowance(initialHolder, spender)
            ).to.be.bignumber.equal(amount);
          });
        });

        describe("when the spender had an approved amount", function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), {
              from: initialHolder,
            });
          });

          it("increases the spender allowance adding the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, {
              from: initialHolder,
            });

            expect(
              await this.token.allowance(initialHolder, spender)
            ).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });

      describe("when the sender does not have enough balance", function () {
        const amount = initialSupply.addn(1);

        it("emits an approval event", async function () {
          expectEvent(
            await this.token.increaseAllowance(spender, amount, {
              from: initialHolder,
            }),
            "Approval",
            { owner: initialHolder, spender: spender, value: amount }
          );
        });

        describe("when there was no approved amount before", function () {
          it("approves the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, {
              from: initialHolder,
            });

            expect(
              await this.token.allowance(initialHolder, spender)
            ).to.be.bignumber.equal(amount);
          });
        });

        describe("when the spender had an approved amount", function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), {
              from: initialHolder,
            });
          });

          it("increases the spender allowance adding the requested amount", async function () {
            await this.token.increaseAllowance(spender, amount, {
              from: initialHolder,
            });

            expect(
              await this.token.allowance(initialHolder, spender)
            ).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });
    });

    describe("when the spender is the zero address", function () {
      const spender = ZERO_ADDRESS;

      it("reverts", async function () {
        await expectRevert(
          this.token.increaseAllowance(spender, amount, {
            from: initialHolder,
          }),
          "ERC20: approve to the zero address"
        );
      });
    });
  });

  describe("mint", function () {
    it("should fail", async function () {
      try {
        await this.token.mint(initialHolder, initialSupply);
      } catch (error) {
        expect(error.message).to.include("this.token.mint is not a function");
        return;
      }
    });
  });

  describe("burn", function () {
    it("should fail", async function () {
      try {
        await this.token.burn(initialHolder, initialSupply);
      } catch (error) {
        expect(error.message).to.include("this.token.burn is not a function");
        return;
      }
    });
  });

  describe("burnFrom", function () {
    it("should fail", async function () {
      try {
        await this.token.burnFrom(initialHolder, initialSupply);
      } catch (error) {
        expect(error.message).to.include(
          "this.token.burnFrom is not a function"
        );
        return;
      }
    });
  });
});
