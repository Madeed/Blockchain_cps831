/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabCar extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const accounts = [
            {
                bank: 'RBC',
                balance: 1234.00,
                owner: 'John',
            },
            {
                bank: 'CIBC',
                balance: 5678.00,
                owner: 'Max',
            },
            
        ];

        for (let i = 0; i < accounts.length; i++) {
            accounts[i].docType = 'account';
            await ctx.stub.putState('ACCOUNT' + i, Buffer.from(JSON.stringify(accounts[i])));
            console.info('Added <--> ', accounts[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryAccount(ctx, accountNumber) {
        const accountAsBytes = await ctx.stub.getState(accountNumber); // get the account from chaincode state
        if (!accountAsBytes || accountAsBytes.length === 0) {
            throw new Error(`${accountNumber} does not exist`);
        }
        console.log(accountAsBytes.toString());
        return accountAsBytes.toString();
    }

    async createAccount(ctx, accountNumber, bank, balance, owner) {
        console.info('============= START : Create Account ===========');

        const account = {
            bank,
            docType: 'account',
            balance,
            owner,
        };

        await ctx.stub.putState(accountNumber, Buffer.from(JSON.stringify(account)));
        console.info('============= END : Create Account ===========');
    }

    async queryAllAccounts(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async deposit(ctx, accountNumber, amount) {
        console.info('============= START : deposit ===========');

        const accountAsBytes = await ctx.stub.getState(accountNumber); // get the account from chaincode state
        if (!accountAsBytes || accountAsBytes.length === 0) {
            throw new Error(`${accountNumber} does not exist`);
        }
        const account = JSON.parse(accountAsBytes.toString());
        let newBalance = parseFloat(account.balance) + parseFloat(amount);
        account.balance = newBalance;

        await ctx.stub.putState(accountNumber, Buffer.from(JSON.stringify(account)));
        console.info('============= END : deposit ===========');
    }

    async withdraw(ctx, accountNumber, amount) {
        console.info('============= START : withdraw ===========');

        const accountAsBytes = await ctx.stub.getState(accountNumber); // get the account from chaincode state
        if (!accountAsBytes || accountAsBytes.length === 0) {
            throw new Error(`${accountNumber} does not exist`);
        }
        const account = JSON.parse(accountAsBytes.toString());
        if (parseFloat(account.balance) < parseFloat(amount)) {
            throw new Error(`Insufficient Balance from ${accountNumber1}`);
        }
        let newBalance = parseFloat(account.balance) - parseFloat(amount);
        account.balance = newBalance;

        await ctx.stub.putState(accountNumber, Buffer.from(JSON.stringify(account)));
        console.info('============= END : withdraw ===========');
    }

    async transfer(ctx, accountNumber1, accountNumber2, amount) {
        console.info('============= START : transfer ===========');

        const account1AsBytes = await ctx.stub.getState(accountNumber1); // get the account1 from chaincode state
        if (!account1AsBytes || account1AsBytes.length === 0) {
            throw new Error(`${accountNumber1} does not exist`);
        }
        const account1 = JSON.parse(account1AsBytes.toString());

        const account2AsBytes = await ctx.stub.getState(accountNumber2); // get the account2 from chaincode state
        if (!account2AsBytes || account2AsBytes.length === 0) {
            throw new Error(`${accountNumber2} does not exist`);
        }
        const account2 = JSON.parse(account2AsBytes.toString());

        if (parseFloat(account1.balance) < parseFloat(amount)) {
            throw new Error(`Insufficient Balance from ${accountNumber1}`);
        }

        let newBalance1 = parseFloat(account1.balance) - parseFloat(amount);
        account1.balance = newBalance1;

        let newBalance2 = parseFloat(account2.balance) + parseFloat(amount);
        account2.balance = newBalance2;

        await ctx.stub.putState(accountNumber1, Buffer.from(JSON.stringify(account1)));
        await ctx.stub.putState(accountNumber2, Buffer.from(JSON.stringify(account2)));
        console.info('============= END : transfer ===========');
    }
}

module.exports = FabCar;
