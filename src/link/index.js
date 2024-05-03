const FORWARD_DELAY_IN_MS = 3000;

function run() {
    const objectData = getObjectDataFromLocation();

    const redirectionVariant = objectData.variant;
    const alternativeVariant = redirectionVariant === 'online' ? 'offline' : 'online';

    setRedirectTarget(redirectionVariant === 'online' ? 'Digidoc Online' : 'Digidoc Offline (zorg dat Digidoc open staat)');

    const urlRedirecting = toDigidocLink(objectData);
    const urlAlternative = toDigidocLink({ ...objectData, variant:  alternativeVariant});

    setAnchorValue('output-alt', urlAlternative.toString(), `Klik hier voor ${alternativeVariant} Digidoc`);

    const startTime = Date.now();
    const timeout = forwardUserToURLAfterDelay({ url: urlRedirecting.toString(), delayInMS: FORWARD_DELAY_IN_MS })
    const interval = startCountdown({ startTime, delayInMS: FORWARD_DELAY_IN_MS });

    cancelForwardOnAlternativeLinkClick({ timeout, interval });
    setFavoriteOnAlternativeLinkClick(alternativeVariant);
}

function getObjectDataFromLocation() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');
    const host = url.searchParams.get('host') || DEFAULT_HOST;
    const variant = url.searchParams.get('variant') || DEFAULT_VARIANT;
    return { id, type, host, variant };
}

function forwardUserToURLAfterDelay({ url, delayInMS }) {
    const timeout = setTimeout(() => {
        window.location.assign(url);
    }, delayInMS);

    return timeout;
}

function startCountdown({ startTime, delayInMS }) { 
    const interval = setInterval(() => {
        const millisPassed = Date.now() - startTime;
        const remainingSeconds = (delayInMS - millisPassed) / 1000;
        setRemainingSeconds(Math.max(1, Math.ceil(remainingSeconds)));
    }, 100);

    return interval;
}

function setRedirectTarget(text) {
    document.getElementById('redirect-target').innerText = text;
}

function setRemainingSeconds(seconds) {
    document.getElementById('seconds').innerText = `${seconds} seconde${seconds > 1 ? 'n' : ''}`;
}

function cancelForwardOnAlternativeLinkClick({ timeout, interval }) {
    document.getElementById('output-alt').addEventListener('click', function () { 
        clearTimeout(timeout);
        clearInterval(interval);
    })
}

function setFavoriteOnAlternativeLinkClick(variant) {
    document.getElementById('output-alt').addEventListener('click', function () { 
        storeFavoriteVariantLocally(variant);
    })
}
