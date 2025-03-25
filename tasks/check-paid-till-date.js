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

            if (err) {
                try {
                    const rdapDate = getRdapExpiryDate(domain);
                    resolve(rdapDate);
                } catch (error) {
                    console.log(`${domain} - err: ${err} - data: ${data}`);
                    reject(err);
                }
            }

            const parsedData = parser.parseWhoIsData(data);
            let paidTillDate;

            for (const [key, param] of Object.entries(parsedData)) {
                if (KEYS.includes(param['attribute'].trim())) {
                    paidTillDate = new Date(param.value);
                    break;
                }
            }

            if (!paidTillDate) reject(new Error(`No registry expiry date was found for domain ${domain} \n ${data}`));

            resolve(paidTillDate);
        });
    });
}

/**
 * Get domain's registry expiry date using RDAP
 * @param {string} domain - The domain name to check
 * @returns {Promise<Date>} - The expiration date
 */
function getRdapExpiryDate(domain) {
    try {
        console.log(`Fetching RDAP data for ${domain}...`);
        const response = fetch(`https://rdap.org/domain/${domain}`);

        if (!response.ok) {
            throw new Error(`RDAP request failed with status: ${response.status}`);
        }

        const data = response.json();

        const expiryEvent = data.events?.find(event =>
            event.eventAction === 'expiration' ||
            event.eventAction === 'registration expiration'
        );

        if (!expiryEvent?.eventDate) {
            throw new Error('No expiry date found in RDAP response');
        }

        const expiryDate = new Date(expiryEvent.eventDate);
        console.log(`Found expiry date via RDAP for ${domain}: ${expiryDate.toISOString()}`);
        return expiryDate;
    } catch (error) {
        console.error(`RDAP lookup error for ${domain}: ${error.message}`);
        throw error;
    }
}

module.exports = getDatePaidTill;
