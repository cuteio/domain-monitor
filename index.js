const core = require('@actions/core');
const github = require('@actions/github');
const CheckCertificate = require('./tasks/check-certificate');
const CheckPaidTillDate = require('./tasks/check-paid-till-date');
const Dates = require('./utils/dates');
const {createOrUpdateIssue} = require('./utils/issue');


class Domain {
    constructor(name, daysLeft, expireDate, checkType, extra="") {
        this.name = name;
	this.daysLeft = daysLeft;
	this.expireDate = expireDate;
	this.checkType = checkType;
	this.extra = extra;
    }
}

async function createIssue(name, daysLeft, expireDate, checkType, assignee, extra) {
    console.log(`${name}: ${daysLeft} - ${expireDate}`);
    record = new Domain(name, daysLeft, expireDate, checkType, extra);
    issue = await createOrUpdateIssue(record, assignee);
    console.log(issue.title);
    console.log(issue.url);
}

async function checkDomain(domain, checker, warningDays, checkType, assignee) {
    try {
        const date = await checker(domain);
        const daysLeft = Dates.countDays(date);
        const expireDate = date.toString();

        if (daysLeft < warningDays) {
            await createIssue(domain, daysLeft, expireDate, checkType, assignee);
        }

        return { daysLeft, expireDate };
    } catch (error) {
        const daysLeft = -1;
        const expireDate = "INVALID";

        await createIssue(
            domain,
            daysLeft,
            expireDate,
            checkType,
            assignee,
            error.message
        );

        console.log(error);
        return { daysLeft, expireDate, error };
    }
}

async function processDomainsWithCheck(domains, checker, warningDays, checkType, assignee) {
    for (const domain of domains) {
        try {
            const result = await checkDomain(domain, checker, warningDays, checkType, assignee);
            console.log(`${domain}: ${result.daysLeft} - ${result.expireDate}`);
        } catch (error) {
            core.error(error);
        }
    }
}

async function main(domains, warningDays, checkType, assignee) {
    var checker;
    switch (checkType) {
        case "ssl":
            checker = CheckCertificate
            break;

        case "registry":
            checker = CheckPaidTillDate
            break;

        default:
            throw new Error(`Unsupported check type: ${checkType}`);
    }

    if (!!checker) {
        await processDomainsWithCheck(
            domains,
            checker,
            warningDays,
            checkType,
            assignee
        );
    }
}

try {
    const domainsRaw = core.getInput('domains');
    const warningDaysRaw = core.getInput('warning-days');
    const checkType = core.getInput('check-type');
    const githubToken = core.getInput('github-token');
    const assignee = core.getInput('assignee');

    const domains = domainsRaw.split('\n').map(domain => domain.trim()).filter(Boolean);
    const warningDays = parseInt(warningDaysRaw) || 30;

    main(domains, warningDays, checkType, assignee);
} catch (error) {
    core.setFailed(error.message);
}
