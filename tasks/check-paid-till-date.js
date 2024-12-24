const parser = require('parse-whois');
const whois = require('whois');

/**
 * Keys in whois response for getting 'paid till' date
 * @type {string[]}
 */
const KEYS = [
    'Registrar Registration Expiration Date',
    'Registry Expiry Date',
    'Expiration Time',
    'Expiry Date',
    'paid-till'
];

/**
 * Get domain's registry expiry date
 * @param domain
 * @returns {Promise<Date>}
 */
function getDatePaidTill(domain) {
    return new Promise((resolve, reject) => {
        whois.lookup(domain, function(err, data) {
            console.log(`check domain ${domain}`);
            console.log(`${data} \n`);
            if (err) {
	        console.log(`${domain} - err: ${err} - data: ${data}`);
		reject(err);
            }

            const parsedData = parser.parseWhoIsData(data);
            let paidTillDate;

            for (const [key, param] of Object.entries(parsedData)) {
                if (KEYS.includes(param['attribute'].trim())) {
                    paidTillDate = new Date(param.value);
                    break;
                }
            }

            if (!paidTillDate) reject(new Error(`No registry expiry date was found for domain ${domain}`));

            resolve(paidTillDate);
        });
    });
}

module.exports = getDatePaidTill;
